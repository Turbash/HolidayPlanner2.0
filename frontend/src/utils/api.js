import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request was made but no response received');
    }
    return Promise.reject(error);
  }
);

export const fetchWeatherData = async (city, tripDays = 5) => {
  try {
    console.log(`Fetching weather for ${city} for ${tripDays} days`);
    const response = await apiClient.get(`/weather/${encodeURIComponent(city)}`, {
      params: { days: tripDays }
    });

    if (response.data && response.data.forecast && response.data.forecast.forecastday) {
      return response.data.forecast.forecastday.map(day => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temp: Math.round(day.day.avgtemp_c),
        tempMin: Math.round(day.day.mintemp_c),
        tempMax: Math.round(day.day.maxtemp_c),
        humidity: day.day.avghumidity,
        description: day.day.condition.text,
        icon: `https:${day.day.condition.icon}`
      }));
    }

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    throw new Error('Invalid weather data format');
  } catch (error) {
    console.error('Error fetching weather:', error);
    return { error: "Could not load weather data" };
  }
};

export const fetchPlanData = async (destination, budget, people, days, groupType) => {
  try {
    localStorage.removeItem('holidayPlan');

    console.log(`Sending plan request with params:`, {
      destination, budget, people, days, group_type: groupType
    });
    
    const response = await apiClient.post('/api/plans', {
      destination,
      budget: parseFloat(budget),
      people: parseInt(people),
      days: parseInt(days),
      group_type: groupType
    });
    console.log('Received plan data:', response.data);

    let data = response.data;
    if (typeof data === "string") {
      data = data.replace(/^[`\s]+|[`]+$/g, '');
      data = JSON.parse(data);
    }

    if (data && typeof data.plan === "string") {
      data = JSON.parse(data.plan);
    } else if (data && data.plan) {
      data = data.plan;
    }

    data.itinerary = data.itinerary || [];
    data.accommodation_suggestions = data.accommodation_suggestions || [];
    data.local_customs = data.local_customs || [];
    data.packing_tips = data.packing_tips || [];
    data.budget_breakdown = data.budget_breakdown || {};

    let weather = null;
    try {
      weather = await fetchWeatherData(destination, days);
    } catch (e) {
      weather = { error: "Could not load weather data" };
    }

    let places = null;
    try {
      places = await fetchPlacesData(destination, { section: "all", limit: 4 });
    } catch (e) {
      places = { error: "Could not load places data" };
    }

    const localData = {
      formParams: { destination, budget, people, days, groupType },
      planData: data,
      weather,
      places
    };
    localStorage.setItem('holidayPlan', JSON.stringify(localData));

    return data;
  } catch (error) {
    console.error('Error fetching plan data:', error, error.response);
    return { error: "Failed to generate holiday plan" };
  }
};

export const fetchSuggestData = async (location, budget, people, days, groupType) => {
  try {
    localStorage.removeItem('destinationSuggestions');

    console.log(`Sending suggestion request with params:`, {
      location, budget, people, days, group_type: groupType
    });
    
    const response = await apiClient.post('/api/suggestions', {
      location,
      budget: parseFloat(budget),
      people: parseInt(people),
      days: parseInt(days),
      group_type: groupType
    });

    let data = response.data;
    console.log('Received suggestion data:', data);
    if (typeof data === "string") {
      data = data.replace(/^[`\s]+|[`]+$/g, '');
      data = JSON.parse(data);
    }

    if (data && typeof data.suggestions === "string") {
      data = JSON.parse(data.suggestions);
    } else if (data && data.suggestions) {
      data = data.suggestions;
    }

    data.suggested_destinations = data.suggested_destinations || [];
    data.itinerary_for_top_choice = data.itinerary_for_top_choice || [];
    data.local_customs = data.local_customs || [];
    data.packing_tips = data.packing_tips || [];
    data.budget_considerations = data.budget_considerations || [];

    let weather = null;
    let places = null;
    const topDestination = data.suggested_destinations?.[0]?.destination;
    if (topDestination) {
      try {
        weather = await fetchWeatherData(topDestination, days);
      } catch (e) {
        weather = { error: "Could not load weather data" };
      }
      try {
        places = await fetchPlacesData(topDestination, { section: "all", limit: 4 });
      } catch (e) {
        places = { error: "Could not load places data" };
      }
    }

    localStorage.setItem('destinationSuggestions', JSON.stringify({
      location,
      budget,
      days,
      people,
      groupType,
      suggestions: data,
      weather,
      places
    }));

    return data;
  } catch (error) {
    console.error('Error fetching suggestion data:', error);
    return { error: "Failed to get destination suggestions" };
  }
};

export const saveTripToDatabase = async (tripData, tripType) => {
  try {
    const response = await apiClient.post('/api/trips/save', {
      trip_type: tripType, 
      data: tripData 
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving trip to database:', error);
    throw error;
  }
};

export const fetchPlacesData = async (city, options = {}) => {
  try {
    let params = { ...options };
    if (params.section === "all") {
      params.limit = 4;
    }
    const response = await apiClient.get(`/places/${encodeURIComponent(city)}`, {
      params
    });
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching places data:", error);
    return { error: error.message || "Could not load places data" };
  }
};

export { apiClient };
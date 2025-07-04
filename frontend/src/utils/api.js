import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

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
    
    if (response.data && response.data.list) {
      return response.data.list.map(item => {
        const date = new Date(item.dt * 1000);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          temp: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          humidity: item.main.humidity,
          description: item.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
        };
      });
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

export const fetchSuggestData = async (location, budget, people, days, groupType) => {
  try {
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

    localStorage.setItem('destinationSuggestions', JSON.stringify({
      location,
      budget,
      days,
      people,
      groupType,
      suggestions: data
    }));

    return data;
  } catch (error) {
    console.error('Error fetching suggestion data:', error);
    return { error: "Failed to get destination suggestions" };
  }
};

export const fetchPlanData = async (destination, budget, people, days, groupType) => {
  try {
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

    const localData = {
      formParams: { destination, budget, people, days, groupType },
      planData: data
    };
    localStorage.setItem('holidayPlan', JSON.stringify(localData));

    return data;
  } catch (error) {
    console.error('Error fetching plan data:', error, error.response);
    return { error: "Failed to generate holiday plan" };
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

export { apiClient };
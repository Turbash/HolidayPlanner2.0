import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

// Simple API call to suggest destinations
export const fetchSuggestData = async (location, budget, people, days, groupType) => {
  try {
    // Make the API call to backend
    const response = await axios.post(`${BACKEND_URL}/suggest-destinations`, {
      location,
      budget,
      people,
      days,
      group_type: groupType
    });
    
    // Save the data to localStorage
    localStorage.setItem('destinationSuggestions', JSON.stringify({
      location,
      budget,
      days, 
      people,
      groupType,
      suggestions: response.data
    }));
    
    // Return the data
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestion data:', error);
    return { error: "Failed to get destination suggestions" };
  }
};

// Simple API call to plan a holiday
export const fetchPlanData = async (destination, budget, people, days, groupType) => {
  try {
    // Make the API call to backend
    const response = await axios.post(`${BACKEND_URL}/plan-holiday`, {
      destination,
      budget,
      people,
      days,
      group_type: groupType
    });
    
    // Save the data to localStorage
    const data = {
      formParams: { destination, budget, people, days, groupType },
      planData: response.data
    };
    
    localStorage.setItem('holidayPlan', JSON.stringify(data));
    
    // Return the data
    return response.data;
  } catch (error) {
    console.error('Error fetching plan data:', error);
    return { error: "Failed to generate holiday plan" };
  }
};

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SummaryTable from "./SummaryTable";
import LoadingState from "./shared/LoadingState";
import ErrorState from "./shared/ErrorState";
import ResultLayout from "./shared/ResultLayout";
import ResultSection from "./shared/ResultSection";
import ListItems from "./shared/ListItems";
import WeatherDisplay from "./shared/WeatherDisplay";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Axios interceptor for global 401 handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const PlanResultPage = () => {
  const [planData, setPlanData] = useState(null);
  const [formParams, setFormParams] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      // Simple loading from localStorage
      const savedData = localStorage.getItem('holidayPlan');
      
      if (!savedData) {
        setError("No plan data found. Please create a plan first.");
        setLoading(false);
        return;
      }
      
      // Parse the data
      const parsedData = JSON.parse(savedData);
      
      // Check if planData is a string (needs parsing)
      if (typeof parsedData.planData === 'string') {
        setPlanData(JSON.parse(parsedData.planData));
      } else {
        setPlanData(parsedData.planData);
      }
      
      setFormParams(parsedData.formParams || {});
      setWeatherData(parsedData.weather || null);
      setLoading(false);
    } catch (err) {
      console.error("Error loading plan data:", err);
      setError("Failed to load plan data. Please try again.");
      setLoading(false);
    }
  }, [navigate]);

  // Function to save the trip
  const handleSaveTrip = async () => {
    try {
      // Check if we're logged in
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login', { state: { from: '/plan/result' } });
        return;
      }

      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Make API call to save the trip
      await axios.post(`${BACKEND_URL}/api/plans`, {
        destination: formParams.destination,
        budget: parseFloat(formParams.budget),
        people: parseInt(formParams.people),
        days: parseInt(formParams.days),
        group_type: formParams.groupType
      });
      
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving trip:', err);
      setError('Failed to save the trip. Please try again.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading your holiday plan..." />;
  }

  if (error) {
    return <ErrorState error={error} returnPath="/plan" />;
  }

  if (!planData) {
    return <ErrorState 
      error="No plan data available. Please create a holiday plan first." 
      returnPath="/plan" 
    />;
  }
  
  // Create summary rows from available data
  const summaryRows = [
    { label: "Destination", value: formParams.destination || "Unknown" },
    { label: "Days", value: planData.itinerary?.length || 0 },
    { label: "Budget", value: `$${formParams.budget || 0}` },
    { label: "Group", value: `${formParams.people || 1} people (${formParams.groupType || 'friends'})` }
  ];

  const summaryComponent = <SummaryTable summaryRows={summaryRows} title="Holiday Plan Summary" />;

  return (
    <ResultLayout
      title="Your Holiday Plan"
      summaryComponent={summaryComponent}
      backButtonLink="/plan"
      backButtonText="Create Another Plan"
      extraButtons={
        <div className="flex space-x-3">
          <Link 
            to="/dashboard" 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Dashboard
          </Link>
          <button
            onClick={handleSaveTrip}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Save Trip
          </button>
        </div>
      }
    >
      {saveSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Trip saved successfully!
        </div>
      )}
      
      {/* Weather Display - Pass the trip days */}
      <WeatherDisplay 
        weatherData={weatherData} 
        location={formParams.destination} 
        color="sky"
        tripDays={parseInt(formParams.days) || 5}
      />
      
      {/* Budget Breakdown Section */}
      {planData.budget_breakdown && (
        <ResultSection title="Budget Breakdown" color="blue">
          <ul>
            {Object.entries(planData.budget_breakdown).map(([category, amount]) => (
              <li key={category} className="flex justify-between mb-1">
                <span className="capitalize">{category.replace(/_/g, ' ')}:</span>
                <span className="font-semibold">${amount}</span>
              </li>
            ))}
          </ul>
        </ResultSection>
      )}
      
      {/* Itinerary Section */}
      <ResultSection 
        title={planData.itinerary?.length > 0 ? `${planData.itinerary.length}-Day Itinerary` : "Itinerary"}
        color="teal"
        isEmpty={!planData.itinerary || planData.itinerary.length === 0}
        emptyMessage="No itinerary available."
      >
        <ul className="space-y-4">
          {planData.itinerary.map(day => (
            <li key={day.day} className="bg-teal-50 rounded-lg p-4 shadow">
              <div className="flex justify-between items-start">
                <strong className="text-lg">Day {day.day}</strong>
                {day.approximate_cost !== undefined && (
                  <div className="bg-teal-100 px-2 py-1 rounded text-sm font-medium">
                    ${day.approximate_cost}
                  </div>
                )}
              </div>
              
              <ul className="list-disc ml-6 mt-2">
                {day.activities?.map((act, i) => (
                  <li key={i} className="my-1">{act}</li>
                ))}
              </ul>
              
              {day.notes && (
                <div className="bg-white/60 p-2 rounded mt-2 text-sm text-gray-700 italic">
                  <span className="font-medium">Notes:</span> {day.notes}
                </div>
              )}
            </li>
          ))}
        </ul>
      </ResultSection>
      
      {/* Accommodation Suggestions */}
      <ResultSection 
        title="Recommended Accommodations"
        color="purple"
        isEmpty={!planData.accommodation_suggestions || planData.accommodation_suggestions.length === 0}
        emptyMessage="No accommodation suggestions available."
      >
        <ul className="space-y-3">
          {planData.accommodation_suggestions.map((acc, i) => (
            <li key={i} className="bg-purple-50 rounded p-3 shadow">
              <div className="flex flex-wrap justify-between items-start">
                <div className="mb-1">
                  <div className="font-bold text-lg">{acc.name}</div>
                  <div className="text-purple-700">${acc.price_per_night} per night</div>
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="font-medium">Total: ${acc.total_cost}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ResultSection>
      
      {/* Local Customs */}
      <ResultSection 
        title="Local Customs" 
        color="blue"
        isEmpty={!planData.local_customs || planData.local_customs.length === 0}
        emptyMessage="No local customs information available."
      >
        <ListItems items={planData.local_customs} />
      </ResultSection>
      
      {/* Packing Tips */}
      <ResultSection 
        title="Packing Tips" 
        color="green"
        isEmpty={!planData.packing_tips || planData.packing_tips.length === 0}
        emptyMessage="No packing tips available."
      >
        <ListItems items={planData.packing_tips} />
      </ResultSection>
    </ResultLayout>
  );
};

export default PlanResultPage;

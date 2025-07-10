import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import SummaryTable from "./SummaryTable";
import LoadingState from "./shared/LoadingState";
import ErrorState from "./shared/ErrorState";
import ResultLayout from "./shared/ResultLayout";
import ResultSection from "./shared/ResultSection";
import ListItems from "./shared/ListItems";
import WeatherDisplay from "./shared/WeatherDisplay";
import PlacesDisplay from "./shared/PlacesDisplay";
import { saveTripToDatabase } from "../utils/api";

const SuggestResultPage = () => {
  const [data, setData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formParams, setFormParams] = useState({});
  const [suggestData, setSuggestData] = useState(null);
  const [places, setPlaces] = useState(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('destinationSuggestions');
      if (!savedData) {
        setError("No suggestion data found. Please get suggestions first.");
        setLoading(false);
        return;
      }
      const parsedData = JSON.parse(savedData);

      let suggestions = parsedData.suggestions;
      if (typeof suggestions === "string") {
        try {
          suggestions = JSON.parse(suggestions);
        } catch {
          suggestions = {};
        }
      }
      if (suggestions && suggestions.data) {
        setSuggestData(suggestions.data);
      } else if (suggestions) {
        setSuggestData(suggestions);
      } else {
        setSuggestData(parsedData.data || {});
      }

      setFormParams({
        location: parsedData.location || "",
        budget: parsedData.budget || "",
        days: parsedData.days || "",
        people: parsedData.people || "",
        groupType: parsedData.groupType || ""
      });

      setWeatherData(parsedData.weather || null);
      setPlaces(parsedData.places || null); // 
      setLoading(false);
    } catch (err) {
      console.error("Error loading suggestion data:", err);
      setError("Failed to load suggestion data. Please try again.");
      setLoading(false);
    }
  }, []);

  const handleSaveTrip = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login', { state: { from: '/suggest/result' } });
        return;
      }

      const savedData = localStorage.getItem('destinationSuggestions');
      if (!savedData) {
        setError("No suggestion data found to save.");
        return;
      }
      const suggestToSave = JSON.parse(savedData);
      
      await saveTripToDatabase(suggestToSave, 'suggest');
      setSaveSuccess(true);
      toast.success("Suggestions saved successfully!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving suggestions:', err);
      setError('Failed to save the suggestions. Please try again.');
      toast.error("Failed to save the suggestions. Please try again.");
    }
  };

  if (loading) {
    return <LoadingState message="Loading your destination suggestions..." />;
  }

  if (error) {
    return <ErrorState error={error} returnPath="/suggest" />;
  }

  if (!suggestData) {
    return <ErrorState 
      error="No suggestion data available. Please get suggestions first." 
      returnPath="/suggest" 
    />;
  }

  const suggestions = suggestData;

  const summaryRows = [
    { label: "Starting Location", value: formParams.location },
    { label: "Budget", value: `$${formParams.budget}` },
    { label: "Trip Duration", value: `${formParams.days} days` },
    { label: "Group Size", value: `${formParams.people} people` },
    { label: "Group Type", value: formParams.groupType },
    { 
      label: "Top Recommendation", 
      value: suggestions?.suggested_destinations?.[0]?.destination || "No recommendations found" 
    }
  ];

  const summaryComponent = <SummaryTable summaryRows={summaryRows} title="Trip Details" />;

  const topDestination = suggestions?.suggested_destinations?.[0]?.destination || "destination";

  return (
    <ResultLayout
      title="Your Travel Suggestions"
      summaryComponent={summaryComponent}
      backButtonLink="/suggest"
      backButtonText="Search for More Destinations"
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
            className="px-4 py-2 bg-green-600 text-white cursor-pointer rounded-lg hover:bg-green-700 transition"
          >
            Save Suggestions
          </button>
        </div>
      }
    >
      {saveSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Suggestions saved successfully!
        </div>
      )}
      
      <WeatherDisplay 
        weatherData={weatherData} 
        location={topDestination} 
        color="sky"
        tripDays={parseInt(formParams.days) || 5}
      />

      <PlacesDisplay places={places} color="amber" />

      <ResultSection 
        title="Suggested Destinations" 
        color="teal"
        isEmpty={!suggestions?.suggested_destinations || suggestions.suggested_destinations.length === 0}
        emptyMessage="No destination suggestions available."
      >
        <div className="space-y-4">
          {suggestions?.suggested_destinations?.map((destination, index) => (
            <div key={index} className="bg-teal-50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-teal-800">{destination.destination}</h3>
                {destination.estimated_total_cost && (
                  <span className="bg-teal-100 px-3 py-1 rounded-full text-teal-800 font-semibold">
                    ${destination.estimated_total_cost}
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 my-2">{destination.reason}</p>
              
              {destination.cost_breakdown && (
                <div className="mt-3 bg-white/80 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 text-teal-700">Cost Breakdown:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(destination.cost_breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">${value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ResultSection>
      
      <ResultSection 
        title={`Itinerary for ${suggestions?.suggested_destinations?.[0]?.destination || "Top Choice"}`}
        color="blue"
        isEmpty={!suggestions?.itinerary_for_top_choice || suggestions.itinerary_for_top_choice.length === 0}
        emptyMessage="No itinerary available for this destination."
      >
        <div className="space-y-4">
          {suggestions.itinerary_for_top_choice.map((day) => (
            <div key={day.day} className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-blue-800">Day {day.day}</h3>
              <ul className="list-disc pl-5 mt-2">
                {day.activities.map((activity, i) => (
                  <li key={i} className="text-gray-700">{activity}</li>
                ))}
              </ul>
              {day.notes && (
                <p className="mt-2 text-sm italic text-gray-600">{day.notes}</p>
              )}
            </div>
          ))}
        </div>
      </ResultSection>
      
      <ResultSection 
        title="Budget Considerations"
        color="amber"
        isEmpty={!suggestions?.budget_considerations || suggestions.budget_considerations.length === 0}
        emptyMessage="No budget considerations available."
      >
        <ListItems items={suggestions.budget_considerations} />
      </ResultSection>
      
      <ResultSection 
        title="Local Customs"
        color="indigo"
        isEmpty={!suggestions?.local_customs || suggestions.local_customs.length === 0}
        emptyMessage="No local customs information available."
      >
        <ListItems items={suggestions.local_customs} />
      </ResultSection>
      
      <ResultSection 
        title="Packing Tips"
        color="green"
        isEmpty={!suggestions?.packing_tips || suggestions.packing_tips.length === 0}
        emptyMessage="No packing tips available."
      >
        <ListItems items={suggestions.packing_tips} />
      </ResultSection>
    </ResultLayout>
  );
};

export default SuggestResultPage;
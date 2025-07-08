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
import { saveTripToDatabase, fetchPlacesData } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PlanResultPage = () => {
  const [planData, setPlanData] = useState(null);
  const [formParams, setFormParams] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [places, setPlaces] = useState(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('holidayPlan');
      if (!savedData) {
        setError("No plan data found. Please create a plan first.");
        setLoading(false);
        return;
      }
      const parsedData = JSON.parse(savedData);

      let plan = parsedData.planData;
      if (plan && plan.data) {
        setPlanData(plan.data);
      } else if (plan) {
        setPlanData(plan);
      } else {
        setPlanData(parsedData.data || {});
      }

      setFormParams(parsedData.formParams || {});
      setWeatherData(parsedData.weather || null);
      setLoading(false);
    } catch (err) {
      console.error("Error loading plan data:", err);
      setError("Failed to load plan data. Please try again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!formParams.destination) return;
    setPlacesLoading(true);
    setPlacesError(null);
    fetchPlacesData(formParams.destination, { section: "all", limit: 6 })
      .then((data) => {
        setPlaces(data);
        setPlacesLoading(false);
      })
      .catch((err) => {
        setPlacesError("Could not load restaurants/hotels.");
        setPlacesLoading(false);
      });
  }, [formParams.destination]);

  const handleSaveTrip = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login', { state: { from: '/plan/result' } });
        return;
      }
      const savedData = localStorage.getItem('holidayPlan');
      if (!savedData) {
        setError("No plan data found to save.");
        return;
      }
      const planToSave = JSON.parse(savedData);
      await saveTripToDatabase(planToSave, 'plan');
      setSaveSuccess(true);
      toast.success("Trip saved successfully!", { position: "top-center", autoClose: 2500 });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving trip:', err);
      setError('Failed to save the trip. Please try again.');
      toast.error("Failed to save the trip. Please try again.", { position: "top-center", autoClose: 3000 });
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition"
          >
            Save Trip
          </button>
        </div>
      }
    >
      <ToastContainer />
      
      <WeatherDisplay 
        weatherData={weatherData} 
        location={formParams.destination} 
        color="sky"
        tripDays={parseInt(formParams.days) || 5}
      />

      <ResultSection
        title="Nearby Restaurants & Hotels"
        color="amber"
        isEmpty={placesLoading || (!places?.restaurants?.length && !places?.hotels?.length)}
        emptyMessage={placesLoading ? "Loading..." : "No restaurants or hotels found."}
      >
        {placesError && <div className="text-red-600">{placesError}</div>}
        {places && (
          <div>
            {places.restaurants?.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold text-amber-700 mb-1">Restaurants:</div>
                <ul className="list-disc ml-6">
                  {places.restaurants.map((r, i) => (
                    <li key={i}>
                      <span className="font-medium">{r.name}</span>
                      {r.rating && <> ({r.rating}★)</>}
                      {r.address && <> - <span className="text-gray-600">{r.address}</span></>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {places.hotels?.length > 0 && (
              <div>
                <div className="font-semibold text-amber-700 mb-1">Hotels:</div>
                <ul className="list-disc ml-6">
                  {places.hotels.map((h, i) => (
                    <li key={i}>
                      <span className="font-medium">{h.name}</span>
                      {h.rating && <> ({h.rating}★)</>}
                      {h.address && <> - <span className="text-gray-600">{h.address}</span></>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </ResultSection>
      
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
      
      <ResultSection 
        title="Local Customs" 
        color="blue"
        isEmpty={!planData.local_customs || planData.local_customs.length === 0}
        emptyMessage="No local customs information available."
      >
        <ListItems items={planData.local_customs} />
      </ResultSection>
      
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

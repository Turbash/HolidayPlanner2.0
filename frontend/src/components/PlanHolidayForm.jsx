import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlanData } from "../utils/api";
import TravelForm from "./shared/TravelForm";

const PlanHolidayForm = () => {
  const [formValues, setFormValues] = useState({
    destination: "",
    budget: "",
    people: "",
    days: "",
    groupType: "friends"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e, field) => {
    setFormValues({
      ...formValues,
      [field]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await fetchPlanData(
        formValues.destination, 
        formValues.budget, 
        formValues.people, 
        formValues.days, 
        formValues.groupType
      );
      
      navigate('/plan/result');
    } catch (error) {
      console.error("Error generating plan:", error);
      setError("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TravelForm
      title="Plan a Holiday"
      formValues={formValues}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      loading={loading}
      error={error}
      alternateLink="/suggest"
      alternateText="Get Suggestions"
      alternatePrompt="Not sure of your destination?"
      submitButtonText="Generate Plan"
      loadingText="Generating Plan..."
      locationLabel="Destination"
    />
  );
};


export default PlanHolidayForm

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlanData } from "../utils/api";
import TravelForm from "./shared/TravelForm";
import { toast } from "react-toastify";

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
      toast.success("Plan generated successfully!");
      navigate('/plan/result');
    } catch (error) {
      console.error("Error generating plan:", error);
      setError("Failed to generate plan. Please try again.");
      toast.error("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
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
    </section>
  );
};


export default PlanHolidayForm

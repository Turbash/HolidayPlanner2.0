import React from "react";
import { Link } from "react-router-dom";
import FormInput from "./FormInput";
import BackToHomeLink from "./BackToHomeLink";

const groupTypes = [
  { value: "friends", label: "Friends" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "solo", label: "Solo" },
];

const TravelForm = ({
  title,
  formValues,
  handleChange,
  handleSubmit,
  loading,
  error,
  alternateLink,
  alternateText,
  alternatePrompt,
  submitButtonText,
  loadingText,
  // locationLabel lets us customize between "Destination" and "Your Location"
  locationLabel = "Location"
}) => {
  const { location, destination, budget, people, days, groupType } = formValues;
  
  // Determine which location field to use based on which is provided
  const locationValue = location || destination || "";
  const locationSetter = location !== undefined ? "location" : "destination";

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
      <BackToHomeLink/>
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 rounded-2xl shadow-xl px-8 py-10 w-full max-w-md flex flex-col gap-6 border border-teal-100"
      >
        <h2 className="text-2xl font-bold text-teal-700 mb-2 text-center">{title}</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        
        <FormInput
          placeholder={locationLabel}
          value={locationValue}
          onChange={e => handleChange(e, locationSetter)}
        />
        
        <FormInput
          type="number"
          placeholder="Budget (USD)"
          value={budget}
          onChange={e => handleChange(e, "budget")}
          min={0}
        />
        
        <FormInput
          type="number"
          placeholder="Number of People"
          value={people}
          onChange={e => handleChange(e, "people")}
          min={1}
        />
        
        <FormInput
          type="number"
          placeholder="Number of Days"
          value={days}
          onChange={e => handleChange(e, "days")}
          min={1}
        />
        
        <select
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={groupType}
          onChange={e => handleChange(e, "groupType")}
        >
          {groupTypes.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        
        <button
          type="submit"
          disabled={loading}
          className={`${loading ? 'opacity-70' : ''} bg-gradient-to-r from-teal-400 to-green-400 text-white font-semibold py-2 rounded-lg shadow hover:scale-105 transition`}
        >
          {loading ? loadingText : submitButtonText}
        </button>
        
        <div className="text-center mt-2">
          <span className="text-gray-600">{alternatePrompt} </span>
          <Link to={alternateLink} className="text-teal-600 font-semibold hover:underline">
            {alternateText}
          </Link>
        </div>
      </form>
    </section>
  );
};

export default TravelForm;

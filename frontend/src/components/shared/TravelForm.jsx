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
  locationLabel = "Location"
}) => {
  const { location, destination, budget, people, days, groupType } = formValues;
  
  const locationValue = location || destination || "";
  const locationSetter = location !== undefined ? "location" : "destination";

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-green-50 px-4 sm:px-6 lg:px-8">
      <BackToHomeLink/>
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl px-8 sm:px-10 py-12 w-full max-w-lg flex flex-col gap-6 border border-white/30 hover:shadow-3xl transition-all duration-300"
      >
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">{title}</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
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
          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
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
          className={`${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'} bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform`}
        >
          {loading ? loadingText : submitButtonText}
        </button>
        
        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-gray-600">{alternatePrompt} </span>
          <Link to={alternateLink} className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
            {alternateText}
          </Link>
        </div>
      </form>
    </section>
  );
};

export default TravelForm;

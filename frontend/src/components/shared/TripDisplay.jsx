import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../utils/api";
import SummaryTable from "../SummaryTable";
import ResultSection from "./ResultSection";
import ListItems from "./ListItems";
import WeatherDisplay from "./WeatherDisplay";
import ResultLayout from "./ResultLayout";
import { toast } from "react-toastify";

const TripDisplay = ({ trip, weatherData }) => {
  const navigate = useNavigate();
  const { tripId } = useParams();

  if (!trip) return null;

  let data = trip.data || {};

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }

  let formParams = data.formParams;
  let planData = data.planData;

  if (typeof planData === "string") {
    try {
      planData = JSON.parse(planData);
    } catch {
      planData = {};
    }
  }

  const isPlan = !!planData;
  const isSuggest = !!data.suggestions || !!data.suggested_destinations;

  const suggestData = data.suggestions || data;

  const summaryRows = isPlan
    ? [
      { label: "Destination", value: formParams?.destination || "Unknown" },
      { label: "Days", value: planData?.itinerary?.length || formParams?.days || 0 },
      { label: "Budget", value: `$${formParams?.budget || 0}` },
      { label: "Group", value: `${formParams?.people || 1} people (${formParams?.groupType || 'friends'})` }
    ]
    : [
      { label: "Destination", value: data.destination || data.location || (suggestData.suggested_destinations?.[0]?.destination ?? "Unknown") },
      { label: "Days", value: data.days || suggestData.itinerary_for_top_choice?.length || data.itinerary?.length || 0 },
      { label: "Budget", value: `$${data.budget || suggestData.budget || 0}` },
      { label: "Group", value: `${data.people || suggestData.people || 1} people (${data.groupType || suggestData.groupType || 'friends'})` }
    ];

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await apiClient.delete(`/api/trips/${tripId}`);
      toast.success("Trip deleted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to delete trip. Please try again.");
    }
  };

  return (
    <ResultLayout
      title="Your Travel Suggestions"
      backButtonLink={`${isSuggest ? "/suggest" : "/plan"}`}
      backButtonText={`${isSuggest ? "Search for More Destinations" : "Create Another Plan"}`}
      extraButtons={
        <div className="flex space-x-3">
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Dashboard
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-green-600 text-white cursor-pointer rounded-lg hover:bg-green-700 transition"
          >
            Delete Trip
          </button>
        </div>
      }
    >

      <SummaryTable summaryRows={summaryRows} title="Trip Summary" />

      <WeatherDisplay
        weatherData={weatherData}
        location={
          isPlan
            ? formParams?.destination
            : data.destination || data.location || suggestData.suggested_destinations?.[0]?.destination
        }
        color="sky"
        tripDays={
          isPlan
            ? parseInt(formParams?.days) || planData?.itinerary?.length || 1
            : parseInt(data.days || suggestData.days) || 5
        }
      />

      {isPlan && planData && (
        <>
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
              {planData.itinerary?.map(day => (
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

          {planData.accommodation_suggestions && (
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
          )}

          {planData.local_customs && (
            <ResultSection
              title="Local Customs"
              color="blue"
              isEmpty={!planData.local_customs || planData.local_customs.length === 0}
              emptyMessage="No local customs information available."
            >
              <ListItems items={planData.local_customs} />
            </ResultSection>
          )}

          {planData.packing_tips && (
            <ResultSection
              title="Packing Tips"
              color="green"
              isEmpty={!planData.packing_tips || planData.packing_tips.length === 0}
              emptyMessage="No packing tips available."
            >
              <ListItems items={planData.packing_tips} />
            </ResultSection>
          )}
        </>
      )}

      {isSuggest && (
        <>
          <ResultSection
            title={suggestData.itinerary_for_top_choice?.length > 0 ? `${suggestData.itinerary_for_top_choice.length}-Day Itinerary` : "Itinerary"}
            color="teal"
            isEmpty={!suggestData.itinerary_for_top_choice || suggestData.itinerary_for_top_choice.length === 0}
            emptyMessage="No itinerary available."
          >
            <ul className="space-y-4">
              {suggestData.itinerary_for_top_choice?.map(day => (
                <li key={day.day} className="bg-teal-50 rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start">
                    <strong className="text-lg">Day {day.day}</strong>
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

          {suggestData.suggested_destinations && (
            <ResultSection
              title="Suggested Destinations"
              color="purple"
              isEmpty={!suggestData.suggested_destinations || suggestData.suggested_destinations.length === 0}
              emptyMessage="No suggestions available."
            >
              <ul className="space-y-3">
                {suggestData.suggested_destinations.map((dest, i) => (
                  <li key={i} className="bg-purple-50 rounded p-3 shadow">
                    <div className="font-bold text-lg">{dest.destination}</div>
                    <div className="text-gray-700">{dest.reason}</div>
                    <div className="text-purple-700 mt-1">Est. Total: ${dest.estimated_total_cost}</div>
                  </li>
                ))}
              </ul>
            </ResultSection>
          )}

          {(suggestData.local_customs || suggestData.packing_tips) && (
            <>
              {suggestData.local_customs && (
                <ResultSection
                  title="Local Customs"
                  color="blue"
                  isEmpty={!suggestData.local_customs || suggestData.local_customs.length === 0}
                  emptyMessage="No local customs information available."
                >
                  <ListItems items={suggestData.local_customs} />
                </ResultSection>
              )}
              {suggestData.packing_tips && (
                <ResultSection
                  title="Packing Tips"
                  color="green"
                  isEmpty={!suggestData.packing_tips || suggestData.packing_tips.length === 0}
                  emptyMessage="No packing tips available."
                >
                  <ListItems items={suggestData.packing_tips} />
                </ResultSection>
              )}
            </>
          )}
        </>
      )}
    
    </ResultLayout >
  );
};

export default TripDisplay;

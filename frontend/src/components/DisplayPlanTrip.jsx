import React from "react";
import ResultSection from "./shared/ResultSection";
import ListItems from "./shared/ListItems";

const DisplayPlanTrip = ({ trip }) => {
  if (!trip || !trip.data) {
    return <div className="text-center py-5">No plan data available</div>;
  }

  const planData = trip.data;

  return (
    <div className="space-y-6">
      {/* Trip Summary */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-semibold text-teal-700 mb-3">Trip Summary</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span className="font-medium">Destination:</span> 
            <span>{trip.destination || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Budget:</span> 
            <span>${trip.budget}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Days:</span> 
            <span>{trip.days}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">People:</span> 
            <span>{trip.people} ({trip.group_type})</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Created:</span> 
            <span>{new Date(trip.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

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
          {planData.itinerary && planData.itinerary.map(day => (
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
          {planData.accommodation_suggestions && planData.accommodation_suggestions.map((acc, i) => (
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
    </div>
  );
};

export default DisplayPlanTrip;

import React from "react";
import ResultSection from "./shared/ResultSection";
import ListItems from "./shared/ListItems";

const DisplaySuggestTrip = ({ trip }) => {
  if (!trip || !trip.data) {
    return <div className="text-center py-5">No suggestion data available</div>;
  }

  const suggestions = trip.data;

  return (
    <div className="space-y-6">
      {/* Trip Summary */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-semibold text-teal-700 mb-3">Trip Summary</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span className="font-medium">From Location:</span> 
            <span>{trip.location || 'N/A'}</span>
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

      {/* Suggested Destinations */}
      <ResultSection 
        title="Suggested Destinations" 
        color="teal"
        isEmpty={!suggestions.suggested_destinations || suggestions.suggested_destinations.length === 0}
        emptyMessage="No destination suggestions available."
      >
        <div className="space-y-4">
          {suggestions.suggested_destinations && suggestions.suggested_destinations.map((destination, index) => (
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
      
      {/* Itinerary */}
      <ResultSection 
        title={`Itinerary for ${suggestions.suggested_destinations?.[0]?.destination || "Top Choice"}`}
        color="blue"
        isEmpty={!suggestions.itinerary_for_top_choice || suggestions.itinerary_for_top_choice.length === 0}
        emptyMessage="No itinerary available for this destination."
      >
        <div className="space-y-4">
          {suggestions.itinerary_for_top_choice && suggestions.itinerary_for_top_choice.map((day) => (
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
      
      {/* Budget Considerations */}
      <ResultSection 
        title="Budget Considerations"
        color="amber"
        isEmpty={!suggestions.budget_considerations || suggestions.budget_considerations.length === 0}
        emptyMessage="No budget considerations available."
      >
        <ListItems items={suggestions.budget_considerations} />
      </ResultSection>
      
      {/* Local Customs */}
      <ResultSection 
        title="Local Customs"
        color="indigo"
        isEmpty={!suggestions.local_customs || suggestions.local_customs.length === 0}
        emptyMessage="No local customs information available."
      >
        <ListItems items={suggestions.local_customs} />
      </ResultSection>
      
      {/* Packing Tips */}
      <ResultSection 
        title="Packing Tips"
        color="green"
        isEmpty={!suggestions.packing_tips || suggestions.packing_tips.length === 0}
        emptyMessage="No packing tips available."
      >
        <ListItems items={suggestions.packing_tips} />
      </ResultSection>
    </div>
  );
};

export default DisplaySuggestTrip;

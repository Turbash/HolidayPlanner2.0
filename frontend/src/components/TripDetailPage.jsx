import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiClient } from "../utils/api";
import LoadingState from "./shared/LoadingState";
import ErrorState from "./shared/ErrorState";
import DisplayPlanTrip from "./DisplayPlanTrip";
import DisplaySuggestTrip from "./DisplaySuggestTrip";

const TripDetailPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await apiClient.get(`/api/trips/${tripId}`);
        setTrip(response.data);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Failed to load trip. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }

    try {
      await apiClient.delete(`/api/trips/${tripId}`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting trip:", err);
      setError("Failed to delete trip. Please try again.");
    }
  };

  if (loading) {
    return <LoadingState message="Loading trip details..." />;
  }

  if (error) {
    return <ErrorState error={error} returnPath="/dashboard" />;
  }

  if (!trip) {
    return <ErrorState error="Trip not found." returnPath="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-sky-100 to-green-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white py-4 px-6 shadow-md rounded-lg mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-700">
            {trip.trip_type === "plan"
              ? `Plan: ${trip.destination}`
              : `Suggestions from ${trip.location}`}
          </h1>
          <div className="flex space-x-3">
            <Link
              to="/"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Dashboard
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete Trip
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {trip.trip_type === "plan" ? (
            <DisplayPlanTrip trip={trip} />
          ) : (
            <DisplaySuggestTrip trip={trip} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;

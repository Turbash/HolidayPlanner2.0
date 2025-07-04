import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../utils/api";
import TripDisplay from "./shared/TripDisplay";
import LoadingState from "./shared/LoadingState";
import ErrorState from "./shared/ErrorState";

const DashboardTripView = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await apiClient.get(`/api/trips/${tripId}`);
        setTrip(response.data);
      } catch (err) {
        setError("Failed to load trip.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  if (loading) return <LoadingState message="Loading trip details..." />;
  if (error) return <ErrorState error={error} returnPath="/dashboard" />;
  if (!trip) return <ErrorState error="No trip found." returnPath="/dashboard" />;

  return (
    <div className="mx-auto pt-8">
      <TripDisplay trip={trip} />
    </div>
  );
};

export default DashboardTripView;
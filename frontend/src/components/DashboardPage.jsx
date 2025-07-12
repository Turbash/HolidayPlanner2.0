import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import LoadingState from "./shared/LoadingState";
import { toast } from "react-toastify";
import DeleteTripModal from "./shared/DeleteTripModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DashboardPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  useEffect(() => {
    const fetchUserAndTrips = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const userResponse = await axios.get(`${BACKEND_URL}/auth/me`);
        setUser(userResponse.data);
        
        const tripsResponse = await axios.get(`${BACKEND_URL}/api/trips`);
        const tripsSorted = (tripsResponse.data || []).slice().sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA;
        });
        setTrips(tripsSorted);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndTrips();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.setItem("showLogoutToast", "1");
    window.location.href = '/';
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/trips/${tripId}`);
      setTrips(trips.filter(trip => trip.id !== tripId));
      toast.success("Trip deleted successfully!");
    } catch (err) {
      console.error('Error deleting trip:', err);
      toast.error('Failed to delete trip. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingState message="Loading your trips..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-sky-100 to-green-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-800">My Dashboard</h1>
            {user && <p className="text-gray-600">Welcome, {user.name}!</p>}
          </div>
          
          <div className="flex space-x-3">
            <Link
              to="/"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </header>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Your Saved Trips</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {trips.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">You haven't saved any trips yet.</p>
                <div className="flex justify-center space-x-4">
                  <Link to="/plan" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                    Plan a Trip
                  </Link>
                  <Link to="/suggest" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Get Suggestions
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map(trip => {
                  let data = trip.data || {};
                  if (typeof data === "string") {
                    try {
                      data = JSON.parse(data);
                    } catch {
                      data = {};
                    }
                  }
                  let formParams = data.formParams || {};
                  let planData = data.planData || {};
                  if (typeof planData === "string") {
                    try {
                      planData = JSON.parse(planData);
                    } catch {
                      planData = {};
                    }
                  }
                  const suggestData = data.suggestions || data;

                  let title = "";
                  let budget = "";
                  let days = "";
                  let people = "";
                  let groupType = "";
                  if (trip.trip_type === "plan") {
                    title = formParams.destination || "Planned Trip";
                    budget = formParams.budget || planData.budget || "";
                    days = formParams.days || planData.days || (planData.itinerary?.length || "");
                    people = formParams.people || planData.people || "";
                    groupType = formParams.groupType || planData.groupType || "";
                  } else {
                    title = suggestData.suggested_destinations?.[0]?.destination
                      ? `Suggestions: ${suggestData.suggested_destinations[0].destination}`
                      : "Suggestions";
                    budget = data.budget || suggestData.budget || "";
                    days = data.days || suggestData.days || (suggestData.itinerary_for_top_choice?.length || "");
                    people = data.people || suggestData.people || "";
                    groupType = data.groupType || suggestData.groupType || "";
                  }

                  return (
                    <div key={trip.id} className="bg-gray-50 rounded-lg overflow-hidden shadow border border-gray-100">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-teal-700">
                            {title}
                          </h3>
                          <span className={`${trip.trip_type === 'plan' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'} text-xs px-2 py-1 rounded-full`}>
                            {trip.trip_type === 'plan' ? 'Plan' : 'Suggestions'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          {budget && <p>Budget: ${budget}</p>}
                          {days && people && groupType && (
                            <p>{days} days • {people} people • {groupType}</p>
                          )}
                          <p>Created: {formatDate(trip.created_at)}</p>
                        </div>
                        <div className="flex justify-between mt-4">
                          <Link to={`/trips/${trip.id}`} className="text-teal-600 hover:underline text-sm">
                            View Details
                          </Link>
                          <button
                            onClick={() => {
                              setTripToDelete(trip.id);
                              setModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/plan"
                className="bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white p-4 rounded-lg transition flex flex-col items-center justify-center text-center"
              >
                <span className="text-xl mb-2">Plan a Holiday</span>
                <span className="text-sm">Create a detailed itinerary for your destination</span>
              </Link>
              
              <Link
                to="/suggest"
                className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white p-4 rounded-lg transition flex flex-col items-center justify-center text-center"
              >
                <span className="text-xl mb-2">Get Destination Suggestions</span>
                <span className="text-sm">Discover destinations based on your preferences</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DeleteTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          if (tripToDelete) handleDeleteTrip(tripToDelete);
        }}
      />
    </div>
  );
};

export default DashboardPage;

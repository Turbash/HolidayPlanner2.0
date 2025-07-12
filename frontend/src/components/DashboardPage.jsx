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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-green-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 lg:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            {user && <p className="text-lg text-gray-700 font-medium mt-2">Welcome back, {user.name}!</p>}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-center"
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white border-2 border-gray-200 cursor-pointer text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
            >
              Logout
            </button>
          </div>
        </header>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8 lg:mb-12 border border-white/20">
          <div className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 lg:mb-8">Your Saved Trips</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}
            
            {trips.length === 0 ? (
              <div className="text-center py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-xl text-gray-600 mb-8">You haven't saved any trips yet.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/plan" className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold">
                    Plan a Trip
                  </Link>
                  <Link to="/suggest" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold">
                    Get Suggestions
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
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
                    <div key={trip.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 group">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-teal-700 group-hover:text-teal-800 transition-colors">
                            {title}
                          </h3>
                          <span className={`${trip.trip_type === 'plan' ? 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800' : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'} text-xs px-3 py-1 rounded-full font-medium`}>
                            {trip.trip_type === 'plan' ? 'Plan' : 'Suggestions'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-6 space-y-1">
                          {budget && <p>Budget: ${budget}</p>}
                          {days && people && groupType && (
                            <p>{days} days • {people} people • {groupType}</p>
                          )}
                          <p>Created: {formatDate(trip.created_at)}</p>
                        </div>
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                          <Link to={`/trips/${trip.id}`} className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors">
                            View Details
                          </Link>
                          <button
                            onClick={() => {
                              setTripToDelete(trip.id);
                              setModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm cursor-pointer font-medium transition-colors"
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
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 lg:mb-8">Quick Actions</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <Link
                to="/plan"
                className="bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white p-8 lg:p-10 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 group"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <span className="text-2xl font-bold mb-3">Plan a Holiday</span>
                <span className="text-base opacity-90">Create a detailed itinerary for your destination</span>
              </Link>
              
              <Link
                to="/suggest"
                className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white p-8 lg:p-10 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 group"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold mb-3">Get Destination Suggestions</span>
                <span className="text-base opacity-90">Discover destinations based on your preferences</span>
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

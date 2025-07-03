import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-teal-700">Holiday Planner</h1>
          
          <nav>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.name}</span>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 bg-white text-teal-600 border border-teal-600 rounded-lg hover:bg-gray-50 transition"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-gradient-to-r from-teal-400 to-green-400 text-white rounded-lg hover:bg-teal-700 transition shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-teal-800 mb-6">Plan Your Perfect Getaway</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create detailed travel plans or discover new destinations based on your preferences, 
            budget, and travel style. Your next unforgettable journey starts here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-teal-700 mb-4">Plan a Holiday</h3>
            <p className="text-gray-600 mb-8">
              Already know where you want to go? Create a detailed itinerary with budget breakdowns, 
              accommodation suggestions, and daily activities.
            </p>
            <Link 
              to={isAuthenticated ? "/plan" : "/login"} 
              className="px-6 py-3 bg-gradient-to-r from-teal-400 to-green-400 text-white rounded-lg hover:scale-105 transition mt-auto shadow"
            >
              {isAuthenticated ? "Create a Plan" : "Log In to Plan"}
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">Get Destination Ideas</h3>
            <p className="text-gray-600 mb-8">
              Not sure where to go? Get personalized destination suggestions based on your 
              budget, travel preferences, and starting location.
            </p>
            <Link 
              to={isAuthenticated ? "/suggest" : "/login"} 
              className="px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-lg hover:scale-105 transition mt-auto shadow"
            >
              {isAuthenticated ? "Find Destinations" : "Log In to Explore"}
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="bg-teal-800 text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Holiday Planner - Plan your perfect trip</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

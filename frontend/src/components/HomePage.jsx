import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-green-50">
      <header className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
            Holiday Planner
          </h1>
          
          <nav>
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
                <Link 
                  to="/dashboard" 
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link 
                  to="/login" 
                  className="px-6 py-3 bg-white text-teal-600 border-2 border-teal-500 rounded-xl hover:bg-teal-50 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl hover:from-teal-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-teal-800 mb-6 lg:mb-8 leading-tight">
            Plan Your Perfect Getaway
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Create detailed travel plans or discover new destinations based on your preferences, 
            budget, and travel style. Your next unforgettable journey starts here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center border border-white/20 group">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-teal-700 mb-4">Plan a Holiday</h3>
            <p className="text-gray-600 mb-8 lg:mb-10 leading-relaxed">
              Already know where you want to go? Create a detailed itinerary with budget breakdowns, 
              accommodation suggestions, and daily activities.
            </p>
            <Link 
              to={isAuthenticated ? "/plan" : "/login"} 
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl hover:from-teal-600 hover:to-green-600 transition-all duration-300 mt-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              {isAuthenticated ? "Create a Plan" : "Log In to Plan"}
            </Link>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center border border-white/20 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-blue-700 mb-4">Get Destination Ideas</h3>
            <p className="text-gray-600 mb-8 lg:mb-10 leading-relaxed">
              Not sure where to go? Get personalized destination suggestions based on your 
              budget, travel preferences, and starting location.
            </p>
            <Link 
              to={isAuthenticated ? "/suggest" : "/login"} 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 mt-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              {isAuthenticated ? "Find Destinations" : "Log In to Explore"}
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="bg-gradient-to-r from-teal-800 to-green-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium">© {new Date().getFullYear()} Holiday Planner - Plan your perfect trip</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

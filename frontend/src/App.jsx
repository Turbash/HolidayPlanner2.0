import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"

// Components
import HomePage from "./components/HomePage" // Changed from HeroSection
import LoginPage from "./components/LoginPage"
import SignupPage from "./components/SignupPage"
import PlanHolidayForm from "./components/PlanHolidayForm"
import SuggestDestinationsForm from "./components/SuggestDestinationsForm"
import PlanResultPage from "./components/PlanResultPage"
import SuggestResultPage from "./components/SuggestResultPage"
import DashboardPage from "./components/DashboardPage"
import TripDetailPage from "./components/TripDetailPage"
import ProtectedRoute from "./components/shared/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Use HomePage as the main landing page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/trips/:tripId" element={
            <ProtectedRoute>
              <TripDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/plan" element={
            <ProtectedRoute>
              <PlanHolidayForm />
            </ProtectedRoute>
          } />
          
          <Route path="/suggest" element={
            <ProtectedRoute>
              <SuggestDestinationsForm />
            </ProtectedRoute>
          } />
          
          <Route path="/plan/result" element={
            <ProtectedRoute>
              <PlanResultPage />
            </ProtectedRoute>
          } />
          
          <Route path="/suggest/result" element={
            <ProtectedRoute>
              <SuggestResultPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

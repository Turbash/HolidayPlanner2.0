import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import HomePage from "./components/HomePage" 
import LoginPage from "./components/LoginPage"
import SignupPage from "./components/SignupPage"
import PlanHolidayForm from "./components/PlanHolidayForm"
import SuggestDestinationsForm from "./components/SuggestDestinationsForm"
import PlanResultPage from "./components/PlanResultPage"
import SuggestResultPage from "./components/SuggestResultPage"
import DashboardPage from "./components/DashboardPage"
import ProtectedRoute from "./components/shared/ProtectedRoute"
import DashboardTripView from "./components/DashboardTripView"

function App() {
  React.useEffect(() => {
    setTimeout(() => {
      if (localStorage.getItem("showLoginToast")) {
        toast.success("Logged in successfully!");
        localStorage.removeItem("showLoginToast");
      }
      if (localStorage.getItem("showSignupToast")) {
        toast.success("Account created and logged in!");
        localStorage.removeItem("showSignupToast");
      }
      if (localStorage.getItem("showLogoutToast")) {
        toast.info("Logged out successfully!");
        localStorage.removeItem("showLogoutToast");
      }
      if (localStorage.getItem("showLoginErrorToast")) {
        toast.error(localStorage.getItem("showLoginErrorToast"));
        localStorage.removeItem("showLoginErrorToast");
      }
      if (localStorage.getItem("showSignupErrorToast")) {
        toast.error(localStorage.getItem("showSignupErrorToast"));
        localStorage.removeItem("showSignupErrorToast");
      }
    }, 100); 
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/trips/:tripId" element={
            <ProtectedRoute>
              <DashboardTripView />
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
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-center" autoClose={2500} />
    </AuthProvider>
  )
}

export default App

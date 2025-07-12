import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "./shared/FormInput";
import axios from 'axios';
import BackToHomeLink from "./shared/BackToHomeLink";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      toast.error("All fields are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      toast.error("Password must be at least 8 characters long");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/auth/register`, {
        name,
        email,
        password
      });
      toast.success("Registration successful! Logging you in...");
      const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, 
        new URLSearchParams({
          'username': email,
          'password': password
        }), 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      toast.success("Logged in successfully!");
      localStorage.setItem("showSignupToast", "1");
      window.location.href = "/";
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Registration failed. Please try again.");
        localStorage.setItem("showSignupErrorToast", err.response.data.detail || "Registration failed. Please try again.");
        window.location.href = "/signup";
      } else {
        setError("Network error. Please check your connection and try again.");
        localStorage.setItem("showSignupErrorToast", "Network error. Please check your connection and try again.");
        window.location.href = "/signup";
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-green-50 px-4 sm:px-6 lg:px-8">
      <BackToHomeLink />
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl px-8 sm:px-10 py-12 w-full max-w-lg flex flex-col gap-6 border border-white/30"
      >
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
            Join Holiday Planner
          </h2>
          <p className="text-gray-600 mt-2">Create your account to start planning</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}
        <FormInput
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormInput
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormInput
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormInput
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'} bg-gradient-to-r cursor-pointer from-teal-500 to-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform`}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
            Log In
          </Link>
        </div>
      </form>
    </section>
  );
};

export default SignupPage;

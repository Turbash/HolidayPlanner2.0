import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "./shared/FormInput";
import axios from 'axios';
import BackToHomeLink from "./shared/BackToHomeLink";
import { toast } from "react-toastify";

const BACKEND_URL = 'http://localhost:8000';

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
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
      <BackToHomeLink />
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 rounded-2xl shadow-xl px-8 py-10 w-full max-w-md flex flex-col gap-6 border border-teal-100"
      >
        <h2 className="text-2xl font-bold text-teal-700 mb-2 text-center">Create an Account</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100">
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
          className={`${loading ? 'opacity-70' : ''} bg-gradient-to-r cursor-pointer from-teal-400 to-green-400 text-white font-semibold py-2 rounded-lg shadow hover:scale-105 transition`}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        <div className="text-center mt-2">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </form>
    </section>
  );
};

export default SignupPage;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "./shared/FormInput";
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Sending registration request with:", { name, email, password });
      
      // Send registration request to backend
      await axios.post(`${BACKEND_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      console.log("Registration successful, attempting login");
      
      // If registration is successful, log the user in
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
      
      console.log("Login successful, token received");
      const { access_token } = loginResponse.data;
      
      // Save token in localStorage
      localStorage.setItem('auth_token', access_token);
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Redirect to dashboard or home page
      navigate('/dashboard');
    } catch (err) {
      console.error("Signup error:", err);
      
      if (err.response && err.response.data) {
        // Get error message from API response
        setError(err.response.data.detail || "Registration failed. Please try again.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
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
          className={`${loading ? 'opacity-70' : ''} bg-gradient-to-r from-teal-400 to-green-400 text-white font-semibold py-2 rounded-lg shadow hover:scale-105 transition`}
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

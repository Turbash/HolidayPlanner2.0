import React, { useState } from "react"
import { Link } from "react-router-dom"
import FormInput from "./shared/FormInput"
import axios from "axios"
import BackToHomeLink from "./shared/BackToHomeLink"
import { toast } from "react-toastify"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required")
      toast.error("Email and password are required")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(
        `${BACKEND_URL}/auth/login`,
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )

      localStorage.setItem("auth_token", response.data.access_token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`
      toast.success("Logged in successfully!")
      localStorage.setItem("showLoginToast", "1");
      window.location.href = "/";
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password")
          localStorage.setItem("showLoginErrorToast", "Invalid email or password");
          window.location.href = "/login";
        } else if (err.response.data && err.response.data.detail) {
          setError(err.response.data.detail)
          localStorage.setItem("showLoginErrorToast", err.response.data.detail);
          window.location.href = "/login";
        } else {
          setError("Login failed. Please try again.")
          localStorage.setItem("showLoginErrorToast", "Login failed. Please try again.");
          window.location.href = "/login";
        }
      } else if (err.request) {
        setError("Network error. Please check your connection and try again.")
        localStorage.setItem("showLoginErrorToast", "Network error. Please check your connection and try again.");
        window.location.href = "/login";
      } else {
        setError("An unexpected error occurred. Please try again.")
        localStorage.setItem("showLoginErrorToast", "An unexpected error occurred. Please try again.");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false)
    }
  }

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-600 mt-2">Log in to your Holiday Planner account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

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

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105 hover:shadow-xl"
          } bg-gradient-to-r from-teal-500 to-green-500 cursor-pointer text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            to="/signup"
            className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </section>
  )
}

export default LoginPage

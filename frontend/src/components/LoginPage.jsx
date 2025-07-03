import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import FormInput from "./shared/FormInput"
import axios from "axios"

const BACKEND_URL = "http://localhost:8000"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)

    try {
      // Send login request to backend
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

      // Make sure we're storing the token with the exact same key used in the API client
      localStorage.setItem("auth_token", response.data.access_token)

      // Immediately set the auth header for subsequent requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`

      // Redirect to the home page after successful login
      navigate("/", { replace: true })
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password")
        } else if (err.response.data && err.response.data.detail) {
          setError(err.response.data.detail)
        } else {
          setError("Login failed. Please try again.")
        }
      } else if (err.request) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 rounded-2xl shadow-xl px-8 py-10 w-full max-w-md flex flex-col gap-6 border border-teal-100"
      >
        <h2 className="text-2xl font-bold text-teal-700 mb-2 text-center">
          Log In to Holiday Planner
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100">
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
            loading ? "opacity-70" : ""
          } bg-gradient-to-r from-teal-400 to-green-400 text-white font-semibold py-2 rounded-lg shadow hover:scale-105 transition`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="text-center mt-2">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            to="/signup"
            className="text-teal-600 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </section>
  )
}

export default LoginPage

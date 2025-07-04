import React, { useState } from "react"
import { Link } from "react-router-dom"
import FormInput from "./shared/FormInput"
import axios from "axios"
import BackToHomeLink from "./shared/BackToHomeLink"
import { toast } from "react-toastify"

const BACKEND_URL = "http://localhost:8000"

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
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
      <BackToHomeLink />
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
          } bg-gradient-to-r from-teal-400 to-green-400 cursor-pointer text-white font-semibold py-2 rounded-lg shadow hover:scale-105 transition`}
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

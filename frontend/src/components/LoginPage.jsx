import React, { useState } from "react"
import { Link } from "react-router-dom"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 rounded-2xl shadow-xl px-8 py-10 w-full max-w-sm flex flex-col gap-6 border border-teal-100"
      >
        <h2 className="text-3xl font-bold text-teal-700 mb-2 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-teal-400 to-green-400 text-white font-semibold py-2 rounded-lg shadow hover:scale-105 transition"
        >
          Log In
        </button>
        <div className="text-center mt-2">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="text-teal-600 font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </section>
  )
}

export default LoginPage

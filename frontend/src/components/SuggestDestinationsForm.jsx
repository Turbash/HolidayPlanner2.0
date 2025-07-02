import React, { useState } from "react"
import { Link } from "react-router-dom"

const groupTypes = [
  { value: "friends", label: "Friends" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "solo", label: "Solo" },
]

const SuggestDestinationsForm = () => {
  const [location, setLocation] = useState("")
  const [budget, setBudget] = useState("")
  const [people, setPeople] = useState("")
  const [days, setDays] = useState("")
  const [groupType, setGroupType] = useState("friends")

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Call /suggest-destinations API
  }

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 rounded-2xl shadow-xl px-8 py-10 w-full max-w-md flex flex-col gap-6 border border-teal-100"
      >
        <h2 className="text-2xl font-bold text-teal-700 mb-2 text-center">Suggest Destinations</h2>
        <input
          type="text"
          placeholder="Your Location"
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Budget (USD)"
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          min={0}
          step={1}
          required
        />
        <input
          type="number"
          placeholder="Number of People"
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={people}
          onChange={e => setPeople(e.target.value)}
          min={1}
          step={1}
          required
        />
        <input
          type="number"
          placeholder="Number of Days"
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          min={1}
          step={1}
          required
        />
        <select
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={groupType}
          onChange={e => setGroupType(e.target.value)}
        >
          {groupTypes.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-gradient-to-r from-teal-400 to-green-400 text-white font-semibold py-2 rounded-lg shadow hover:scale-105 transition"
        >
          Suggest Destinations
        </button>
        <div className="text-center mt-2">
          <span className="text-gray-600">Want to plan a holiday instead? </span>
          <Link to="/plan" className="text-teal-600 font-semibold hover:underline">
            Plan Holiday
          </Link>
        </div>
      </form>
    </section>
  )
}

export default SuggestDestinationsForm

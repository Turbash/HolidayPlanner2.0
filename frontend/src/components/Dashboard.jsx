import React from "react"
import { Link } from "react-router-dom"

const dummyPlans = [
  {
    id: 1,
    title: "Paris Getaway",
    date: "2024-07-01",
    summary: "3 days in Paris for 2 people"
  },
  {
    id: 2,
    title: "Bali Adventure",
    date: "2024-08-15",
    summary: "5 days in Bali for 4 friends"
  }
]

const Dashboard = () => (
  <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100 px-4 py-8">
    <div className="bg-white/90 rounded-2xl shadow-xl px-8 py-10 w-full max-w-2xl border border-teal-100">
      <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center">Your Dashboard</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-teal-600 mb-2">Saved Plans</h3>
        <ul className="space-y-4">
          {dummyPlans.map(plan => (
            <li key={plan.id} className="bg-teal-50 rounded-lg p-4 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-bold">{plan.title}</div>
                <div className="text-gray-600 text-sm">{plan.summary}</div>
                <div className="text-gray-400 text-xs">Saved on {plan.date}</div>
              </div>
              <Link to="/plan/result" className="mt-2 sm:mt-0 inline-block px-4 py-1 bg-teal-400 text-white rounded shadow hover:bg-teal-500 transition">
                View
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/plan" className="px-6 py-2 bg-gradient-to-r from-teal-400 to-green-400 text-white rounded-full shadow hover:scale-105 transition font-semibold">
          New Plan
        </Link>
        <Link to="/suggest" className="px-6 py-2 bg-gradient-to-r from-green-400 to-teal-400 text-white rounded-full shadow hover:scale-105 transition font-semibold">
          Suggest Destinations
        </Link>
      </div>
    </div>
  </section>
)

export default Dashboard

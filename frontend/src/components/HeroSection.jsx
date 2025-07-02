import React from "react"

const HeroSection = () => (
  <section className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
    <div className="w-full max-w-2xl px-4 text-center">
      <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-green-200 via-sky-200 to-teal-200 shadow mb-6">
        <span className="text-base font-semibold text-teal-700 tracking-wide">
          Plan Your Next Adventure
        </span>
      </div>
      <h1
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-sky-400 to-green-400 mb-4 drop-shadow-lg"
        style={{ fontFamily: "'Pacifico', cursive, sans-serif" }}
      >
        Holiday Planner
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-teal-800 mb-10 font-medium drop-shadow-sm">
        Plan your perfect trip with AI-powered itineraries and destination suggestions.
      </p>
      <button className="px-8 py-3 bg-gradient-to-r from-green-400 via-sky-400 to-teal-400 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition font-bold text-lg">
        Get Started
      </button>
    </div>
  </section>
)

export default HeroSection

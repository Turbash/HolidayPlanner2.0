import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchSuggestData } from "../utils/api"
import TravelForm from "./shared/TravelForm"
import BackToHomeLink from "./shared/BackToHomeLink"
import { toast } from "react-toastify"

const SuggestDestinationsForm = () => {
  const [formValues, setFormValues] = useState({
    location: "",
    budget: "",
    people: "",
    days: "",
    groupType: "friends"
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e, field) => {
    setFormValues({
      ...formValues,
      [field]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      await fetchSuggestData(
        formValues.location,
        formValues.budget,
        formValues.people,
        formValues.days,
        formValues.groupType
      )
      toast.success("Suggestions generated successfully!");
      navigate('/suggest/result')
    } catch (error) {
      console.error("Error getting suggestions:", error)
      setError("Failed to get suggestions. Please try again.")
      toast.error("Failed to get suggestions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-sky-100 to-green-100">
      <TravelForm
        title="Suggest Destinations"
        formValues={formValues}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        error={error}
        alternateLink="/plan"
        alternateText="Plan Holiday"
        alternatePrompt="Have a particular destination in mind?"
        submitButtonText="Suggest Destinations"
        loadingText="Finding Suggestions..."
        locationLabel="Your Location"
      />
    </section>
  )
}


export default SuggestDestinationsForm

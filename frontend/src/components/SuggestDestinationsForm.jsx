import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchSuggestData } from "../utils/api"
import TravelForm from "./shared/TravelForm"

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
      
      navigate('/suggest/result')
    } catch (error) {
      console.error("Error getting suggestions:", error)
      setError("Failed to get suggestions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
}


export default SuggestDestinationsForm

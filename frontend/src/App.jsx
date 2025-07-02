import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HeroSection from "./components/HeroSection"
import LoginPage from "./components/LoginPage"
import SignupPage from "./components/SignupPage"
import PlanHolidayForm from "./components/PlanHolidayForm"
import SuggestDestinationsForm from "./components/SuggestDestinationsForm"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/plan" element={<PlanHolidayForm />} />
        <Route path="/suggest" element={<SuggestDestinationsForm />} />
      </Routes>
    </Router>
  )
}

export default App

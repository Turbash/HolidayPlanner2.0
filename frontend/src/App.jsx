import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HeroSection from "./components/HeroSection"
import LoginPage from "./components/LoginPage"
import SignupPage from "./components/SignupPage"
import PlanHolidayForm from "./components/PlanHolidayForm"
import SuggestDestinationsForm from "./components/SuggestDestinationsForm"
import PlanResultPage from "./components/PlanResultPage"
import SuggestResultPage from "./components/SuggestResultPage"
import Dashboard from "./components/Dashboard"
import SummaryTable from "./components/SummaryTable"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/plan" element={<PlanHolidayForm />} />
        <Route path="/suggest" element={<SuggestDestinationsForm />} />
        <Route path="/plan/result" element={<PlanResultPage />} />
        <Route path="/suggest/result" element={<SuggestResultPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/summary" element={<SummaryTable />} />
      </Routes>
    </Router>
  )
}

export default App

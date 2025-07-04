import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <ToastContainer position="top-center" autoClose={2500} />
  </React.StrictMode>
);

// Show logout toast after redirect if needed
if (sessionStorage.getItem("showLogoutToast")) {
  toast.info("Logged out successfully!");
  sessionStorage.removeItem("showLogoutToast");
}

// Show login/signup success toast after redirect if needed
if (sessionStorage.getItem("showLoginToast")) {
  toast.success("Logged in successfully!");
  sessionStorage.removeItem("showLoginToast");
}
if (sessionStorage.getItem("showSignupToast")) {
  toast.success("Account created and logged in!");
  sessionStorage.removeItem("showSignupToast");
}

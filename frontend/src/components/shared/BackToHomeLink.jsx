import React from "react";
import { Link } from "react-router-dom";

const BackToHomeLink = () => (
  <div className="w-full max-w-lg mb-6">
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-teal-600 hover:text-teal-700 hover:bg-white/90 transition-all duration-200 rounded-xl shadow-md hover:shadow-lg border border-white/30 font-medium group"
      tabIndex={0}
    >
      <svg 
        width="18" 
        height="18" 
        fill="none" 
        viewBox="0 0 24 24" 
        className="transition-transform group-hover:-translate-x-0.5"
      >
        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Back to Home
    </Link>
  </div>
);

export default BackToHomeLink;

import React from "react";
import { Link } from "react-router-dom";

const BackToHomeLink = () => (
  <div className="w-full max-w-lg mb-12 mt-8">
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-teal-700 hover:text-teal-800 hover:bg-white transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl border border-teal-200 font-semibold group"
      tabIndex={0}
    >
      <svg 
        width="18" 
        height="18" 
        fill="none" 
        viewBox="0 0 24 24" 
        className="transition-transform group-hover:-translate-x-1"
      >
        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Back to Home
    </Link>
  </div>
);

export default BackToHomeLink;

import React from "react";
import { useNavigate } from "react-router-dom";

const ResultLayout = ({ 
  title, 
  summaryComponent, 
  children, 
  backButtonLink, 
  backButtonText 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-sky-100 to-green-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Header and Summary */}
          <h1 className="text-3xl font-bold text-center text-teal-700 mb-6">
            {title}
          </h1>
          
          {summaryComponent}
          
          {/* Main Content */}
          <div className="mt-8 space-y-8">
            {children}
            
            {/* Back Button */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => navigate(backButtonLink)}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-md"
              >
                {backButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultLayout;

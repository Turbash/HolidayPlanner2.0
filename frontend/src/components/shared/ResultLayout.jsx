import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ResultLayout = ({ 
  title, 
  summaryComponent, 
  children, 
  backButtonLink, 
  backButtonText,
  extraButtons
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-sky-100 to-green-100 pb-10">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-700">{title}</h1>
          
          <div className="flex items-center space-x-3">
            {extraButtons}
            
            <Link
              to={backButtonLink || "/"}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              {backButtonText || "Back"}
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {summaryComponent && (
          <div className="mb-8">
            {summaryComponent}
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default ResultLayout;

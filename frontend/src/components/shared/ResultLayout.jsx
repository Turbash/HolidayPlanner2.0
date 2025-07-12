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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-green-50 pb-10">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">{title}</h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {extraButtons}
            
            <Link
              to={backButtonLink || "/"}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-center"
            >
              {backButtonText || "Back"}
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {summaryComponent && (
          <div className="mb-8 lg:mb-12">
            {summaryComponent}
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default ResultLayout;

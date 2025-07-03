import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorState = ({ error, returnPath }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-sky-100 to-green-100 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => navigate(returnPath)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          Go Back and Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorState;

import React from 'react';

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-sky-100 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-teal-700">{message}</h2>
        <p className="text-gray-600 mt-2">Please wait a moment</p>
      </div>
    </div>
  );
};

export default LoadingState;

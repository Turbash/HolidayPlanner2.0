import React from 'react';

const FormInput = ({ type = "text", placeholder, value, onChange, min, required = true, className = "" }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md ${className}`}
      value={value}
      onChange={onChange}
      min={min}
      required={required}
    />
  );
};

export default FormInput;

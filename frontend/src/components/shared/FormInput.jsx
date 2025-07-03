import React from 'react';

const FormInput = ({ type = "text", placeholder, value, onChange, min, required = true, className = "" }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300 ${className}`}
      value={value}
      onChange={onChange}
      min={min}
      required={required}
    />
  );
};

export default FormInput;

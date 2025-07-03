import React from "react";

const ListItems = ({ items, className = "" }) => {
  return (
    <ul className={`list-disc pl-5 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="text-gray-700 mb-1">{item}</li>
      ))}
    </ul>
  );
};

export default ListItems;

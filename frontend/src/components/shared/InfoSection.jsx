import React from 'react';

const InfoSection = ({ title, items, color = "teal", emptyMessage = "No information available" }) => {
  const colorClasses = {
    teal: {
      title: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-100"
    },
    blue: {
      title: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    amber: {
      title: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    green: {
      title: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100"
    },
    indigo: {
      title: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    red: {
      title: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100"
    },
    purple: {
      title: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100"
    }
  };
  
  const classes = colorClasses[color] || colorClasses.teal;
  
  return (
    <section className="mb-6">
      <h3 className={`text-xl font-semibold ${classes.title} mb-2`}>{title}</h3>
      <div className={`${classes.bg} rounded-lg p-4 shadow`}>
        {items && items.length > 0 ? (
          <ul className="list-disc pl-5">
            {items.map((item, index) => (
              <li key={index} className="text-gray-700 mb-1">{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
};

export default InfoSection;

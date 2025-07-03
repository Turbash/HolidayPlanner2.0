import React from "react";

const ResultSection = ({
  title, 
  color = "teal", 
  isEmpty = false, 
  emptyMessage = "No data available",
  children
}) => {
  const colorClasses = {
    teal: {
      title: "text-teal-600",
      bg: "bg-teal-50"
    },
    blue: {
      title: "text-blue-600",
      bg: "bg-blue-50"
    },
    amber: {
      title: "text-amber-600",
      bg: "bg-amber-50"
    },
    green: {
      title: "text-green-600",
      bg: "bg-green-50"
    },
    indigo: {
      title: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    red: {
      title: "text-red-600",
      bg: "bg-red-50"
    },
    purple: {
      title: "text-purple-600",
      bg: "bg-purple-50"
    }
  };
  
  const classes = colorClasses[color] || colorClasses.teal;
  
  return (
    <section className="mb-6">
      <h2 className={`text-xl font-semibold ${classes.title} mb-2`}>
        {title}
      </h2>
      
      {isEmpty ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-red-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className={`${classes.bg} rounded-lg p-4 shadow`}>
          {children}
        </div>
      )}
    </section>
  );
};

export default ResultSection;

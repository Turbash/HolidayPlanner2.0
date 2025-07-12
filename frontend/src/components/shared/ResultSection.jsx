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
    <section className="mb-8 lg:mb-10">
      <h2 className={`text-xl sm:text-2xl font-bold ${classes.title} mb-4 lg:mb-6`}>
        {title}
      </h2>
      
      {isEmpty ? (
        <div className="bg-red-50 border border-red-200 p-6 lg:p-8 rounded-2xl text-center">
          <p className="text-red-600 text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className={`${classes.bg} rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20`}>
          {children}
        </div>
      )}
    </section>
  );
};

export default ResultSection;

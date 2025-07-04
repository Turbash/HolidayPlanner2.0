import React, { useRef, useState, useEffect } from 'react';
import ResultSection from './ResultSection';

const WeatherDisplay = ({ weatherData, location, color = "sky", tripDays }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Check for scrollability and update button visibility
  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    
    // Check if content overflows
    const hasOverflow = container.scrollWidth > container.clientWidth;
    
    // Only show left button if scrolled right
    setShowLeftScroll(container.scrollLeft > 10); // 10px buffer
    
    // Only show right button if there's more content to scroll to
    setShowRightScroll(
      hasOverflow && container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Initialize and add event listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initial check
      checkScrollability();
      
      // Add scroll event listener
      container.addEventListener('scroll', checkScrollability);
      
      // Add resize listener to recheck when window changes
      window.addEventListener('resize', checkScrollability);
      
      // Cleanup
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [weatherData]); // Re-run when weather data changes

  // Scroll left/right buttons functionality
  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of the visible width
    
    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  // Check if we have valid weather data
  if (!weatherData || weatherData.error || weatherData.length === 0) {
    return (
      <ResultSection
        title={`Weather Forecast for ${location}`}
        color={color}
        isEmpty={true}
        emptyMessage="Weather information is currently unavailable."
      />
    );
  }

  return (
    <ResultSection title={`Weather Forecast for ${location}`} color={color}>
      <div className="relative flex justify-center" >
        {showLeftScroll && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition-opacity"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        {showRightScroll && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition-opacity"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-2 hide-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {weatherData.map((day, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 bg-white rounded-lg shadow p-3 text-center mx-1 w-[140px]"
            >
              <div className="font-bold text-gray-800">{day.day}</div>
              <div className="text-xs text-gray-500">{day.date}</div>
              
              <div className="flex justify-center my-1">
                <img 
                  src={day.icon} 
                  alt={day.description} 
                  className="w-14 h-14" 
                />
              </div>
              
              <div className="text-lg font-semibold text-gray-800">{day.temp}°C</div>
              <div className="text-xs text-gray-600 capitalize">{day.description}</div>
              
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-blue-500">{day.tempMin}°</span>
                <span className="text-gray-500">|</span>
                <span className="text-red-500">{day.tempMax}°</span>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                Humidity: {day.humidity}%
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </ResultSection>
  );
};

export default WeatherDisplay;

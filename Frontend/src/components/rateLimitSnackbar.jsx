import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, X } from 'lucide-react'; // Using lucide-react for icons

/**
 * Reusable component to display a rate limit exceeded notification
 * with a countdown timer, positioned in the top-left corner.
 * * @param {object} props - Component props
 * @param {boolean} props.isVisible - Controls the visibility of the snackbar.
 * @param {number} props.resetTimeSeconds - The time until the limit resets (in seconds).
 * @param {function} props.onClose - Function to call when the snackbar should be dismissed.
 */
const RateLimitSnackbar = ({ isVisible, resetTimeSeconds: initialResetTime, onClose }) => {
  const [resetTime, setResetTime] = useState(initialResetTime);

  // Effect to handle the countdown logic
  useEffect(() => {
    // Sync the local state when the prop changes (e.g., a new 429 error occurs)
    setResetTime(initialResetTime);
    
    if (!isVisible || initialResetTime <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResetTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-hide the snackbar when the countdown finishes
          onClose(); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup function to clear the interval when the component unmounts or deps change
    return () => clearInterval(timer);
  }, [isVisible, initialResetTime, onClose]);
  
  // Style for the snackbar - Updated for cleaner, modern look (MUI inspired)
  const snackbarClasses = `
    fixed top-4 left-4 z-50 py-3 px-5 rounded-lg shadow-2xl 
    transition-all duration-300 ease-out
    max-w-xs sm:max-w-md w-full
    bg-gray-800 text-white
    border border-red-500
    ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'}
  `;

  const minutes = Math.floor(resetTime / 60);
  const seconds = resetTime % 60;

  return (
    <div className={snackbarClasses} role="alert">
      <div className="flex items-center justify-between space-x-4">
        
        {/* Icon and Main Content */}
        <div className="flex items-start space-x-3 flex-grow">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400 mt-1" />
          
          <div className="flex-grow">
            <p className="font-semibold text-base">Rate Limit Exceeded</p>
            <p className="text-sm text-gray-300 mt-0.5">
              You have sent too many requests.
            </p>
            
            {resetTime > 0 && (
              <div className="flex items-center mt-2 text-xs font-medium bg-gray-700 text-red-300 px-2 py-1 rounded-full w-fit">
                <Clock className="w-3 h-3 mr-1.5" />
                Reset in: {minutes > 0 && `${minutes}m `}{seconds}s
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="p-1 -mr-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RateLimitSnackbar;
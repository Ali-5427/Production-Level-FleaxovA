'use client';

import { useState, useEffect } from 'react';

// This is to inform TypeScript about the Razorpay object that the script will add to the window
declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * A custom React hook to dynamically load the Razorpay checkout script.
 * This ensures the script is loaded only once and only when needed, improving performance.
 * 
 * @returns {object} An object containing:
 *  - `isLoaded`: A boolean indicating if the script has successfully loaded.
 *  - `error`: A string containing an error message if loading failed.
 */
export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only once on the client to load the script.
    // It also prevents reloading if the script is already on the page from a previous navigation.
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      // Check if the Razorpay object is available on the window
      if (window.Razorpay) {
        setIsLoaded(true);
      } else {
        const errorMessage = 'Razorpay SDK loaded, but Razorpay object not found on window.';
        setError(errorMessage);
        console.error(errorMessage);
      }
    };

    script.onerror = () => {
      const errorMessage = 'Razorpay SDK failed to load. Please check your internet connection.';
      setError(errorMessage);
      console.error(errorMessage);
    };

    document.body.appendChild(script);

  }, []);

  return { isLoaded, error };
};

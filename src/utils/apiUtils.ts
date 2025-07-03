import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

/**
 * Handle API errors in a consistent way
 * @param error The error object from axios
 * @param defaultMessage Default message to show if error doesn't have a response
 * @returns Empty array or object depending on context
 */
export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred'): Error => {
  console.error('API Error Details:', error);
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Handle specific status codes
    if (axiosError.response) {
      const status = axiosError.response.status;
      
      // Authentication error
      if (status === 401) {
        return new Error('Authentication failed. Please log in again.');
      }
      
      // Server returned an error message
      if (axiosError.response.data && typeof axiosError.response.data === 'object') {
        const data = axiosError.response.data as any;
        if (data.message) {
          return new Error(data.message);
        }
      }
    }
    
    // Network error
    if (axiosError.code === 'ECONNABORTED' || !axiosError.response) {
      return new Error('Network error. Please check your connection.');
    }
  }
  
  // Default error message
  if (error instanceof Error) {
    return error;
  }
  
  return new Error(defaultMessage);
};

/**
 * Checks if the current authentication token is valid
 * @returns true if token exists, false otherwise
 */
export const hasValidToken = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Check if token is expired by decoding it
    // This is a simple check - for a real app you might want to validate with the server
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Check if token has expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token has expired, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
}; 
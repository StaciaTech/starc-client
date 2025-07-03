import authService from '@/services/authService';

/**
 * Checks if the current user has admin privileges
 * @returns A promise resolving to true if user is an admin, false otherwise
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    // First try to check from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.role === 'admin') {
          return true;
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
    
    // If not found in localStorage, try to get from server
    const userData = await authService.getCurrentUser();
    return userData?.data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}; 
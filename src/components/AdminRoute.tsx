import React, { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '@/services/authService';
import { useAuth } from '@/App';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // First check if user is available in context
      if (isAuthenticated && user?.role === 'admin') {
        setIsAdmin(true);
        return;
      }

      // If not, try to get user from localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.role === 'admin') {
            setIsAdmin(true);
            return;
          }
        }

        // If still not determined, try to fetch from server
        if (isAuthenticated) {
          const response = await authService.getCurrentUser();
          if (response?.data?.role === 'admin') {
            setIsAdmin(true);
            return;
          }
        }

        // If we get here, user is not admin
        setIsAdmin(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user]);

  // Show loading state until admin status is determined
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63FF]"></div>
      </div>
    );
  }

  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/LoginPage" />;
};

export default AdminRoute; 
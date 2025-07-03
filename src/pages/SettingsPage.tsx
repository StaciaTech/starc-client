import React, { useState, useEffect } from 'react';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileTopNavbar from '../components/ProfileTopNavbar';
import SettingsTabs from '../components/SettingsTab';
import { getUserProfile } from '@/services/profileService';
import { Menu } from 'lucide-react';

interface UserData {
  name: string;
  email?: string;
  role?: string;
}

const SettingsPage = () => {
  const [user, setUser] = useState<UserData>({
    name: "Student",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        if (userData) {
          setUser({
            name: userData.name || "Student",
            email: userData.email,
            role: userData.role
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    
    // Hide sidebar when resizing window to larger size
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Close sidebar when clicking outside
  const handleOutsideClick = () => {
    if (showSidebar) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50">
        <ProfileTopNavbar userName={user.name} onMenuToggle={toggleSidebar} />
      </div>
      
      <div className="flex flex-1 overflow-hidden w-full relative">
        {/* Mobile overlay for sidebar */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={handleOutsideClick}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar - fixed position on mobile when active */}
        <div className={`
          ${showSidebar ? 'fixed left-0' : 'hidden'} 
          md:relative md:block
          z-40 bg-white h-full w-[240px] md:w-1/4 lg:w-1/5
          overflow-y-auto transition-all duration-300 ease-in-out
          pt-4 px-4 shadow-lg md:shadow-none
        `}>
          <ProfileSidebar user={user} />
        </div>
        
        {/* Mobile sidebar toggle button - fixed position at bottom */}
        <div className="md:hidden fixed bottom-6 left-6 z-50">
          <button 
            onClick={toggleSidebar}
            className="bg-[#8A63FF] p-3 rounded-full shadow-lg text-white"
            aria-label="Toggle sidebar menu"
          >
            <Menu size={20} />
          </button>
        </div>
        
        {/* Main content - settings tabs */}
        <div className="flex-1 w-full md:w-3/4 lg:w-4/5 overflow-y-auto py-6 px-4" style={{scrollbarWidth:'none'}}>
          <SettingsTabs />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
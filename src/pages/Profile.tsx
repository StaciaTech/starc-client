import { useState, useEffect, useMemo } from "react";
import { getUserProfile } from "@/services/profileService";
import { Button } from "@/components/ui/button";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileTopNavbar from "../components/ProfileTopNavbar";
import DashboardOverview from "../components/DashboardOverview";
import RightSideBarComp from "@/components/RightSideBarComp";
import { Menu, Calendar } from "lucide-react";

interface UserData {
  name: string;
  email?: string;
  role?: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserData>({
    name: "Student",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);

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
  }, []);

  // Toggle mobile menus
  const toggleLeftSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isRightSidebarOpen) setIsRightSidebarOpen(false);
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  // Memoize components to prevent unnecessary re-renders
  const memoizedSidebar = useMemo(() => <ProfileSidebar user={user} />, [user]);
  const memoizedDashboard = useMemo(() => <DashboardOverview />, []);
  const memoizedRightSidebar = useMemo(() => <RightSideBarComp />, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50">
        <ProfileTopNavbar 
          userName={user.name} 
          onMenuToggle={toggleLeftSidebar}
        />
      </header>
      
      <main className="flex flex-1 w-full overflow-hidden relative">
        {/* Left sidebar - hidden on mobile, visible on md screens and up */}
        <aside className={`hidden md:block md:w-1/4 lg:w-1/5 xl:w-1/5 p-2 md:p-4`}>
          {memoizedSidebar}
        </aside>
        
        {/* Mobile left sidebar drawer - visible only when menu is open */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleLeftSidebar}></div>
            <div className="fixed inset-y-0 left-0 flex flex-col w-[70%] max-w-xs bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={toggleLeftSidebar} className="p-2 rounded-md hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {memoizedSidebar}
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile right sidebar drawer - visible only when calendar is open */}
        {isRightSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleRightSidebar}></div>
            <div className="fixed inset-y-0 right-0 flex flex-col w-[85%] max-w-sm bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Schedule</h2>
                <button onClick={toggleRightSidebar} className="p-2 rounded-md hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 sm:p-3">
                {memoizedRightSidebar}
              </div>
            </div>
          </div>
        )}
        
        {/* Main content - takes full width on mobile, adjusted on larger screens */}
        <section className="flex flex-col md:flex-row flex-1 overflow-hidden w-full">
          {/* Dashboard content */}
          <div className="w-full md:w-full lg:w-4/5 overflow-y-auto relative">
            {/* Mobile toggle buttons floating at the bottom */}
            <div className="fixed bottom-4 right-4 flex space-x-3 md:hidden z-30">
              {/* Toggle right sidebar button */}
              <button 
                onClick={toggleRightSidebar}
                className="bg-[#8A63FF] text-white p-3 rounded-full shadow-lg"
                aria-label="Toggle schedule"
              >
                <Calendar size={20} />
              </button>
              
              {/* Toggle left sidebar button */}
              <button 
                onClick={toggleLeftSidebar}
                className="bg-[#8A63FF] text-white p-3 rounded-full shadow-lg"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
            </div>
            
            {/* Dashboard content */}
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63FF]"></div>
              </div>
            ) : (
              <div className="h-full">
                {memoizedDashboard}
              </div>
            )}
          </div>
          
          {/* Right sidebar - hidden on mobile and small screens, visible on lg screens and up */}
          <aside className="hidden lg:block lg:w-1/5 p-2 lg:p-3 h-screen overflow-y-auto">
            {memoizedRightSidebar}
          </aside>
        </section>
      </main>
    </div>
  );
};

export default Profile;

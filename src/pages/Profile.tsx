import { useState, useEffect, useMemo } from "react";
import { getUserProfile, getEnrolledCourses } from "@/services/profileService";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileTopNavbar from "../components/ProfileTopNavbar";
import DashboardOverview from "../components/DashboardOverview";
import RightSideBarComp from "@/components/RightSideBarComp";
import { Menu, Calendar, X } from "lucide-react";

interface UserData {
  name: string;
  email?: string;
  role?: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserData>({
    name: "Student",
  });
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State for mobile drawers
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const [userData, coursesData] = await Promise.all([
          getUserProfile(),
          getEnrolledCourses(),
        ]);

        if (userData) {
          setUser({
            name: userData.name || "Student",
            email: userData.email,
            role: userData.role,
          });
        }
        if (coursesData) {
          setEnrolledCourses(coursesData);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handlers
  const toggleLeftSidebar = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (isRightSidebarOpen) setIsRightSidebarOpen(false); // Close other
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen((prev) => !prev);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false); // Close other
  };

  // Close drawers when screen size increases to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
      if (window.innerWidth >= 1024) setIsRightSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize components
  const memoizedSidebar = useMemo(() => <ProfileSidebar user={user} />, [user]);
  const memoizedDashboard = useMemo(() => <DashboardOverview />, []);
  const memoizedRightSidebar = useMemo(
    () => <RightSideBarComp enrolledCourses={enrolledCourses} />,
    [enrolledCourses],
  );

  return (
    // OUTER CONTAINER: h-screen ensures no body scroll, w-screen prevents horizontal scroll
    <div className="flex flex-col h-screen w-screen bg-gray-100 overflow-hidden text-gray-900">
      {/* HEADER: Fixed height, strict z-index */}
      <header className="flex-none z-30 h-16 bg-white shadow-sm border-b">
        <ProfileTopNavbar
          userName={user.name}
          onMenuToggle={toggleLeftSidebar}
        />
      </header>

      {/* MAIN LAYOUT: Flex row for Sidebars + Content */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* 1. LEFT SIDEBAR (DESKTOP) 
            Hidden on mobile, visible on md+. 
            Fixed widths help preserve center content ratio.
        */}
        <aside className="hidden md:flex flex-col flex-none w-60 lg:w-64 border-r border-gray-200 bg-white overflow-y-auto scrollbar-thin">
          <div className="p-4">{memoizedSidebar}</div>
        </aside>

        {/* 2. CENTER CONTENT 
            flex-1: Takes remaining space.
            min-w-0: CRITICAL. Prevents flex items from overflowing x-axis.
            overflow-y-auto: Only this middle part scrolls.
        */}
        <section className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden scroll-smooth bg-gray-50/50">
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {loading ? (
              <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63FF]"></div>
              </div>
            ) : (
              memoizedDashboard
            )}
          </div>
        </section>

        {/* 3. RIGHT SIDEBAR (DESKTOP)
            Hidden on mobile/tablet, visible on lg+.
        */}
        <aside className="hidden lg:flex flex-col flex-none w-72 xl:w-80 border-l border-gray-200 bg-white overflow-y-auto scrollbar-thin">
          <div className="p-4">{memoizedRightSidebar}</div>
        </aside>

        {/* --- MOBILE DRAWERS --- */}

        {/* Mobile Left Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative flex flex-col w-[80%] max-w-[300px] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-lg text-gray-800">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {memoizedSidebar}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Right Sidebar Overlay */}
        {isRightSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsRightSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="relative flex flex-col w-[85%] max-w-[320px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-lg text-gray-800">
                  Schedule & Updates
                </h2>
                <button
                  onClick={() => setIsRightSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {memoizedRightSidebar}
              </div>
            </div>
          </div>
        )}

        {/* FLOATING ACTION BUTTONS (Mobile/Tablet only) */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4 lg:hidden pointer-events-none">
          {/* Buttons are pointer-events-auto so you can click them, but the container doesn't block clicks */}

          {/* Show Schedule Button (visible below lg) */}
          <button
            onClick={toggleRightSidebar}
            className="pointer-events-auto bg-white text-[#8A63FF] p-3 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-transform active:scale-95"
            aria-label="Toggle schedule"
          >
            <Calendar size={22} />
          </button>

          {/* Show Menu Button (visible below md only, because sidebar exists on md) */}
          <button
            onClick={toggleLeftSidebar}
            className="md:hidden pointer-events-auto bg-[#8A63FF] text-white p-3.5 rounded-full shadow-xl shadow-purple-200 hover:bg-[#7a53ef] transition-transform active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;

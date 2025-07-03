import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Heart, User, ArrowRight, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../Assets/EDIFAI-1.svg"
import authService from "@/services/authService";
import { useAuth, AUTH_STATE_CHANGED_EVENT } from "@/App";

const Navbar = () => {
  const { isAuthenticated, user, checkAuthStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({ isAuthenticated, user });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    // Update local state when context changes
    setAuthState({ isAuthenticated, user });
    
    // Listen for auth state change events
    const handleAuthChange = (event: any) => {
      const { isAuthenticated, user } = event.detail;
      console.log("Auth state changed event received in Navbar:", { isAuthenticated, user });
      setAuthState({ isAuthenticated, user });
    };
    
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthChange);
    
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthChange);
    };
  }, [isAuthenticated, user]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Force check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    authService.logout();
    checkAuthStatus();
    navigate('/');
  };

  const navItems = [
    { id: "home", label: "Home", path: "/" },
    { id: "course", label: "Courses", path: "/course" },
    { id: "book", label: "Books", path: "/book" },
    { id: "about", label: "About Us", path: "/about" },
    { id: "contact", label: "Contact Us", path: "/contact" }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="w-[95%] sm:w-[90%] mx-auto flex items-center justify-between h-20">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img src={logo} className="w-[6rem] sm:w-[8rem]" alt="EDIFAI Logo" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 hover:text-[#8A63FF] focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center items-center gap-2 lg:gap-4 xl:gap-4 2xl:gap-8 3xl:gap-14">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`text-xs lg:text-sm xl:text-sm 2xl:text-sm 3xl:text-[1rem] font-medium ${isActive(item.path) ? 'text-[#8A63FF]' : 'text-[#474747] hover:text-[#8A63FF]'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {authState.isAuthenticated ? (
            <div className="flex items-center space-x-2 lg:space-x-4">
              
              <Link to="/profile">
                <Button variant="outline" className="text-[#8A63FF] border-[#8A63FF] hover:bg-[#8A63FF] font-mont font-medium hover:text-white rounded-full flex items-center text-xs lg:text-sm px-3 lg:px-4 h-8 lg:h-10">
                  <User className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="truncate max-w-[100px]">{authState.user?.name || 'Profile'}</span>
                </Button>
              </Link>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="text-[#8A63FF] border-[#8A63FF] hover:bg-[#8A63FF] font-mont font-medium hover:text-white rounded-full flex items-center text-xs lg:text-sm h-8 lg:h-10"
              >
                <LogOut className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/LoginPage">
                <Button className="bg-white border-2 text-xs lg:text-sm hover:bg-gray-300 text-[#8A63FF] font-mont font-medium rounded-full px-4 py-1 lg:px-6 lg:py-2 h-8 lg:h-10">
                  Log In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu - overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-75 flex justify-end">
          <div className="w-[70%] bg-white h-full shadow-xl p-4 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <img src={logo} className="w-[6rem]" alt="EDIFAI Logo" />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-4 mb-8">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`py-2 px-4 rounded-lg ${isActive(item.path) 
                    ? 'bg-purple-100 text-[#8A63FF] font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile Auth Buttons */}
            <div className="mt-auto border-t pt-4">
              {authState.isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  <Link to="/profile" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                    <User className="h-5 w-5 mr-3 text-[#8A63FF]" />
                    <span className="text-gray-800">{authState.user?.name || 'Profile'}</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center p-2 hover:bg-gray-100 rounded-lg w-full text-left"
                  >
                    <LogOut className="h-5 w-5 mr-3 text-red-500" />
                    <span className="text-red-500">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/LoginPage" 
                    className="bg-[#8A63FF] text-white font-medium rounded-lg py-3 px-4 text-center"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

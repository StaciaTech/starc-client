import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Heart, User, ArrowRight, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../Assets/EDIFAI-1.svg"
import authService from "@/services/authService";
import { useAuth, AUTH_STATE_CHANGED_EVENT } from "@/App";

const Navbar = () => {
  const { isAuthenticated, user, checkAuthStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({ isAuthenticated, user });

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
    { id: "book", label: "Books", path: "/books" },
    { id: "about", label: "About Us", path: "/about" },
    { id: "contact", label: "Contact Us", path: "/contact" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className=" w-[90%] mx-auto flex items-center justify-between h-20">
        {/* Logo */}
        <div className="flex-shrink-0 w-[33%] ">
          <Link to="/" className="lg:text-xl xl:text-2xl  3xl:text-4xl font-bold text-[#8A63FF]"><img  src={logo} className="w-[8rem] " /></Link>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center items-center lg:gap-4 xl:gap-4 2xl:gap-8 3xl:gap-14 w-[35%]  ">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`lg:text-xs xl:text-sm 2xl:text-sm 3xl:text-[1rem] font-medium ${isActive(item.path) ? 'text-[#8A63FF]' : 'text-[#474747] hover:text-[#8A63FF]'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-end justify-end space-x-4  w-[33%]">
          {authState.isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="text-[#8A63FF]  border rounded-[50%] border-[#8A63FF] hover:text-white hover:bg-[#8A63FF]">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="text-[#8A63FF]  border rounded-[50%] border-[#8A63FF] hover:bg-[#8A63FF] hover:text-white">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="text-[#8A63FF] border-[#8A63FF] hover:bg-[#8A63FF] font-mont font-medium hover:text-white rounded-full flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {authState.user?.name || 'Profile'}
                </Button>
              </Link>

              <Button onClick={handleLogout} variant="outline" className="text-[#8A63FF] border-[#8A63FF] hover:bg-[#8A63FF] font-mont font-medium hover:text-white rounded-full flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>

            </div>
          ) : (
            <>
              <Link to="/LoginPage">
                <Button className="bg-white border-2  text-sm lg:text-xs xl:text-sm 2xl:text-base hover:bg-gray-300   text-[#8A63FF] font-mont font-medium rounded-full px-6 py-2 flex items-center justify-center">
                  Log In
                </Button>
              </Link>
              {/* <Link to="/signup">
                <Button className="bg-[#8A63FF]  text-sm lg:text-xs xl:text-sm 2xl:text-base hover:bg-[#6D28D9]  text-white font-mont font-medium rounded-full px-6 py-2 flex items-center justify-center">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link> */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

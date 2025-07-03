import React, { memo } from 'react';
import { Search, Bell, Heart, Menu, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "../Assets/EDIFAI.svg";

interface ProfileTopNavbarProps {
  userName: string;
  onMenuToggle?: () => void;
}

const ProfileTopNavbar: React.FC<ProfileTopNavbarProps> = memo(({ userName, onMenuToggle }) => {
  return (
    <div className="bg-white p-1 px-4 sm:px-8 md:px-16 flex items-center justify-between shadow-md rounded-lg w-full h-20">
      <div className="flex items-center">
        {/* Mobile menu toggle */}
        <button 
          className="mr-2 md:hidden text-gray-700 hover:text-[#8A63FF] focus:outline-none" 
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        
        {/* Logo */}
        <Link to="/" className="text-[#8A63FF] font-bold text-[36px]">
          <img src={logo} className="w-[6rem] sm:w-[8rem]" alt="EDIFAI Logo" />
        </Link>
      </div>

      {/* Search Bar - Hide on small screens */}
      <div className="relative hidden md:block flex-grow mx-[5%] lg:mx-[15%] xl:mx-[25%]">
        <input
          type="text"
          placeholder="Search Anything here"
          className="w-full py-2 md:py-3 pl-10 pr-4 rounded-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-[#8A63FF] focus:border-transparent"
          aria-label="Search"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {/* User Icons */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link to="/notifications" className="hidden sm:block">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#8A63FF] border rounded-[50%] border-[#8A63FF] hover:text-white hover:bg-[#8A63FF] h-8 w-8 sm:h-10 sm:w-10"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        </Link>
        
        <Link to="/wishlist" className="hidden sm:block">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#8A63FF] border rounded-[50%] border-[#8A63FF] hover:bg-[#8A63FF] hover:text-white h-8 w-8 sm:h-10 sm:w-10"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        </Link>

        <Link to="/profile">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#8A63FF] flex items-center justify-center bg-[#8A63FF]/10 cursor-pointer">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#8A63FF]" />
          </div>
        </Link>
      </div>
    </div>
  );
});

ProfileTopNavbar.displayName = 'ProfileTopNavbar';

export default ProfileTopNavbar;
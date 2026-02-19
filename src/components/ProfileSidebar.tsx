import React, { memo, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Book, Calendar, Settings, User } from 'lucide-react';

interface UserData {
  name: string;
  email?: string;
  role?: string;
}

interface ProfileSidebarProps {
  user?: UserData;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = memo(({ user = { name: 'Student' } }) => {
  // Define navigation items once
  const navItems = useMemo(() => [
    { path: '/profile', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Overview' },
    { path: '/course', icon: <BookOpen className="h-5 w-5" />, label: 'Courses' },
    { path: '/book', icon: <Book className="h-5 w-5" />, label: 'Books' },
    { path: '/schedule', icon: <Calendar className="h-5 w-5" />, label: 'Schedule' },
    { path: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ], []);

  return (
    <div className="bg-white rounded-[16px] h-full shadow-md p-4 w-full">
      {/* User Profile Section */}
      <div className="flex items-center mb-6">  
        <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden mr-3 bg-[#8A63FF]/10 flex items-center justify-center">
          <User className="w-5 h-5 lg:w-6 lg:h-6 text-[#8A63FF]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-gray-600 text-[10px] lg:text-xs truncate">Hello!</p>
          <h2 className="text-sm lg:text-base font-semibold text-gray-900 truncate" title={user.name}>{user.name}</h2>
        </div>
      </div>  

      <hr className="border-gray-200 mb-6" />

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#8A63FF] text-white"
                      : "text-gray-600 hover:bg-purple-50"
                  }`
                }
              >
                <span className="mr-3 flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
});

ProfileSidebar.displayName = 'ProfileSidebar';

export default ProfileSidebar;
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
    <div className="bg-white rounded-[16px] h-[80vh] shadow-md p-4 lg:w-[190px] xl:w-[220px] 2xl:w-[250px] 3xl:w-[274px]">
      {/* User Profile Section */}
      <div className="flex items-center mb-6">  
        <div className="lg:w-12 lg:h-12 xl:w-16 xl:h-16 rounded-full overflow-hidden mr-4 bg-[#8A63FF]/10 flex items-center justify-center">
          <User className="lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-[#8A63FF]" />
        </div>
        <div>
          <p className="text-gray-600 lg:text-[9px] xl:text-[11px] 2xl:text-sm">Hello!</p>
          <h2 className="lg:text-xs xl:text-sm 2xl:text-base 3xl:text-lg font-semibold text-gray-900">{user.name}</h2>
        </div>
      </div>  

      <hr className="border-gray-200 mb-6" />

      {/* Navigation Items */}
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#8A63FF] text-white"
                      : "text-gray-600 hover:bg-purple-50"
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span className="lg:text-xs xl:text-sm 2xl:text-base">{item.label}</span>
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
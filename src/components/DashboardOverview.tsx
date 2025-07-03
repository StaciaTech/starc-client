import React, { useState, useEffect, memo, useMemo } from 'react';
import { getUserProfile, getUserActivity } from '@/services/profileService';
import ContinueLearning from './ContinueLearning';
import { Search, Bell, Heart, LayoutDashboard, Award, TrendingUp, BookOpen } from 'lucide-react';
import DashboardCard from './DashboardCard';

// Import assets
import hour from '../Assets/hour.svg';
import earned from '../Assets/earned.svg';
import trophy from '../Assets/trophy.svg';
import awardbg from '../Assets/card-award.png';

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface UserActivity {
// import course1 from '../Assets/icons/course1.svg'
// import course2 from '../Assets/icons/course2.svg'
// import course3 from '../Assets/icons/course3.svg'
// import course4 from '../Assets/icons/course4.svg'
// import course5 from '../Assets/icons/course5.svg'
// import course6 from '../Assets/icons/course6.svg'
// import OngoingCourseDashboardPage from './OngoingCourse';
// import CourseDashboardPage from './CompletedCourse';

// interface Course {
//   id: string;
//   title: string;
//   duration: string;
//   progress: number;
//   image: string;
//   status: string;
// }

// interface User {
//   name: string;
  learningHours: number;
  certificatesEarned: number;
  coursesEnrolled: number;
  progress: number;
  recentActivity: any[];
}

const DashboardOverview: React.FC = memo(() => {
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActivity, setHasActivity] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use Promise.all to fetch data in parallel
        const [userProfileData, userActivityData] = await Promise.all([
          getUserProfile(),
          getUserActivity()
        ]);
        
        setUser(userProfileData);
        setActivity(userActivityData);
        
        // Check if user has any activity data
        setHasActivity(
          userActivityData.coursesEnrolled > 0 || 
          userActivityData.learningHours > 0 ||
          userActivityData.certificatesEarned > 0 ||
          (userActivityData.recentActivity && userActivityData.recentActivity.length > 0)
        );
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Default values if data isn't available
  const userName = user?.name || 'Student';
  const learningHours = activity?.learningHours || 0;
  const certificatesEarned = activity?.certificatesEarned || 0;
  const coursesEnrolled = activity?.coursesEnrolled || 0;
  const progress = activity?.progress || 0;

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63FF]"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#8A63FF] text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-4 py-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#8A63FF] mb-4 md:mb-6 truncate">Hello {userName} 👋</h1>

      {hasActivity ? (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {/* Purpose Card */}
            <div className="bg-purple-600 relative rounded-xl overflow-hidden shadow-lg text-white p-3 sm:p-4 col-span-1 h-auto aspect-[4/3] sm:aspect-auto">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${awardbg})`, opacity: 0.8 }}></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 line-clamp-1">Achieve with purpose</h2>
                  <p className="text-purple-100 text-xs sm:text-sm mb-2 line-clamp-2">
                    Track your progress and complete courses to earn certificates.
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <div className="text-xl sm:text-2xl font-bold">{certificatesEarned}/{coursesEnrolled || 1}</div>
                    <img src={trophy} alt="Trophy" className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain" />
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-1.5 mb-2 sm:mb-3">
                    <div 
                      className="bg-white h-1.5 rounded-full" 
                      style={{ width: `${(certificatesEarned/(coursesEnrolled || 1))*100}%` }}
                    ></div>
                  </div>
                  <button className="bg-white text-purple-600 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium hover:bg-gray-100 w-auto truncate">
                    Start Now
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col space-y-3 sm:space-y-4">
              {/* Learning Hours Card */}
              <div className="bg-white rounded-xl shadow p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 h-[4.5rem]">
                <div className="p-2 bg-gradient-to-b from-[#868CFF] to-[#8A63FF] rounded-full flex-shrink-0">
                  <img src={hour} alt="Hour Icon" className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm truncate">Learning Hour</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold flex items-baseline">
                    {learningHours} <span className="text-xs text-gray-500 ml-1 truncate">(This week)</span>
                  </p>
                </div>
              </div>

              {/* Certificates Card */}
              <div className="bg-white rounded-xl shadow p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 h-[4.5rem]">
                <div className="p-2 bg-gradient-to-b from-[#868CFF] to-[#8A63FF] rounded-full flex-shrink-0">
                  <img src={earned} alt="Earned Icon" className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm truncate">Certificates</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold">{certificatesEarned}</p>
                </div>
              </div>
            </div>

            {/* Courses Progress Card */}
            <div className="bg-white rounded-xl shadow p-3 sm:p-4 col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col items-center">
                <h3 className="text-gray-700 text-sm font-medium mb-2 sm:mb-3 truncate">Courses Enrolled</h3>
                
                {/* Circular Progress Indicator */}
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 mb-3 sm:mb-4">
                  {/* Background Circle */}
                  <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="stroke-gray-200"
                      cx="50"
                      cy="50"
                      r="45"
                      strokeWidth="10"
                      fill="none"
                    />
                  </svg>
                  
                  {/* Progress Circle */}
                  <svg className="absolute w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle
                      className="stroke-[#8A63FF]"
                      cx="50"
                      cy="50"
                      r="45"
                      strokeWidth="10"
                      strokeDasharray="282.7"
                      strokeDashoffset={282.7 - (282.7 * progress) / 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {coursesEnrolled}
                    </span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center space-x-4 sm:space-x-8 w-full">
                  <div className="flex items-center">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#8A63FF] mr-1 sm:mr-2"></div>
                    <span className="text-xs sm:text-sm text-gray-600">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-gray-200 mr-1 sm:mr-2"></div>
                    <span className="text-xs sm:text-sm text-gray-600">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Learning Section */}
          <div className="mt-6 sm:mt-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Continue Learning</h2>
            <ContinueLearning />
          </div>
        </>
      ) : (
        // No activity state
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center mt-4">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-16 w-16 text-[#8A63FF]/30" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">No Learning Activity</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Start your learning journey by exploring our courses.
          </p>
          <a 
            href="/course" 
            className="inline-block bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-medium px-6 py-3 rounded-full transition-colors"
          >
            Browse Courses
          </a>
        </div>
      )}
    </div>
  );
});

DashboardOverview.displayName = 'DashboardOverview';

export default DashboardOverview;
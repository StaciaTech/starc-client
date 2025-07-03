import React, { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Globe, MessageSquare } from "lucide-react";
import star from "../Assets/stargirl.jpg"; // Ensure the path is correct
import opp from "../Assets/opicon.png";
import learning from "../assests/learn.png";
import global from "../Assets/global.png";
import course from "../Assets/courses.png";
import learn from "../Assets/learning.svg";
import { useNavigate } from "react-router-dom";

import video from "../Assets/about-video/final.mp4";

const WhyChoose: React.FC = () => {
  const toNavigation = useNavigate();
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Check device type
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Initial check
    checkDeviceType();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkDeviceType);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Determine if mobile layout should be used
  const useMobileLayout = deviceType === 'mobile';
  // Determine if tablet-specific adjustments are needed
  const isTablet = deviceType === 'tablet';

  return (
    <section className="py-6 md:py-10 min-h-[500px] md:h-auto lg:h-[80vh] bg-white overflow-hidden relative">
      {/* Concentric Circles Background - Hidden on small mobile for better performance */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-30 md:opacity-100">
        <div className="relative w-[80%] md:w-[38%] aspect-square">
          <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "#9539E50A" }}></div>
          <div className="absolute inset-[10%] rounded-full" style={{ backgroundColor: "#0066FF0D" }}></div>
          <div className="absolute inset-[20%] rounded-full" style={{ backgroundColor: "#9539E54A" }}></div>
        </div>
      </div>

      <div className="w-[90%] md:w-[85%] lg:w-[70%] mx-auto px-4 pb-2 h-full relative z-10">
        {useMobileLayout ? (
          <div className="flex flex-col gap-6">
            {/* Video Container for Mobile - Positioned at the top with 9:16 aspect ratio */}
            <div className="flex justify-center items-center mt-4 mb-6">
              <div className="w-[56.25%] rounded-2xl overflow-hidden shadow-lg">
                {/* Using padding-bottom technique for 9:16 aspect ratio (177.78% = 16/9 * 100%) */}
                <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
                  <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    poster={star} // Use image as poster until video loads
                    controls
                    preload="metadata"
                    onLoadedData={() => setVideoLoaded(true)}
                    onError={(e) => {
                      console.error("Error loading video:", e);
                      e.currentTarget.poster = "https://via.placeholder.com/320x480";
                    }}
                  >
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            {/* Cards in a 2x2 Grid for Mobile */}
            <div className="grid grid-cols-2 gap-4">
              {/* Courses Card */}
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img src={course} alt="Courses" className="w-8 h-8" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 text-center">Courses</h3>
                  <p className="text-xs text-gray-600 mb-2 text-center">Access meticulously crafted courses.</p>
                  <button 
                    className="bg-[#8A63FF] text-white px-3 py-1 rounded-full text-xs hover:bg-opacity-85"
                    onClick={() => toNavigation('/course')}
                  >
                    Courses
                  </button>
                </div>
              </div>

              {/* 100K+ Card */}
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img src={global} alt="Global" className="w-8 h-8" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 text-center">100K+</h3>
                  <p className="text-xs text-gray-600 text-center">Join 100,000+ learners globally.</p>
                </div>
              </div>

              {/* Opportunities Card */}
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img src={opp} alt="Opportunities" className="w-8 h-8" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 text-center">Opportunities</h3>
                  <p className="text-xs text-gray-600 text-center">Discover new career paths.</p>
                </div>
              </div>

              {/* Learning Card */}
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img src={learn} alt="Learning" className="w-8 h-8" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 text-center">Learning</h3>
                  <p className="text-xs text-gray-600 text-center">Interactive content & expert instructors.</p>
                </div>
              </div>
            </div>
          </div>
        ) : isTablet ? (
          /* Tablet-specific layout */
          <div className="flex flex-col gap-8">
            {/* Video Container for Tablet - Centered with proper sizing */}
            <div className="flex justify-center items-center py-6">
              <div className="w-[40%] rounded-3xl overflow-hidden shadow-2xl">
                {/* Using padding-bottom technique for 9:16 aspect ratio (177.78% = 16/9 * 100%) */}
                <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
                  <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    poster={star}
                    controls
                    preload="metadata"
                    onLoadedData={() => setVideoLoaded(true)}
                    onError={(e) => {
                      console.error("Error loading video:", e);
                      e.currentTarget.poster = "https://via.placeholder.com/320x480";
                    }}
                  >
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            {/* Cards in a single row for Tablet */}
            <div className="grid grid-cols-4 gap-4 px-4 pb-8">
              {/* Courses Card */}
              <div className="bg-white rounded-xl p-4 shadow-xl">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img src={course} alt="Courses" className="w-10 h-10" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-base text-gray-900 mb-2 text-center">Courses</h3>
                  <p className="text-sm text-gray-600 mb-3 text-center">Access meticulously crafted courses.</p>
                  <button 
                    className="bg-[#8A63FF] text-white px-4 py-1 rounded-full text-sm hover:bg-opacity-85"
                    onClick={() => toNavigation('/course')}
                  >
                    Courses
                  </button>
                </div>
              </div>

              {/* 100K+ Card */}
              <div className="bg-white rounded-xl p-4 shadow-xl">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img src={global} alt="Global" className="w-10 h-10" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-base text-gray-900 mb-2 text-center">100K+</h3>
                  <p className="text-sm text-gray-600 text-center">Join 100,000+ learners globally.</p>
                </div>
              </div>

              {/* Opportunities Card */}
              <div className="bg-white rounded-xl p-4 shadow-xl">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img src={opp} alt="Opportunities" className="w-10 h-10" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-base text-gray-900 mb-2 text-center">Opportunities</h3>
                  <p className="text-sm text-gray-600 text-center">Discover new career paths.</p>
                </div>
              </div>

              {/* Learning Card */}
              <div className="bg-white rounded-xl p-4 shadow-xl">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img src={learn} alt="Learning" className="w-10 h-10" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-base text-gray-900 mb-2 text-center">Learning</h3>
                  <p className="text-sm text-gray-600 text-center">Interactive content & expert instructors.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop layout with 3 columns */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center w-full h-full">
            {/* Left Cards Column */}
            <div className="flex flex-col gap-6 h-full justify-end pb-[20%] items-end">
              {/* Courses Card */}
              <div className="w-[70%] grid grid-cols-1 bg-white rounded-3xl lg:p-1 3xl:p-4 shadow-2xl lg:text-xs xl:text-sm 2xl:text-base">
                <div className="p-1 rounded-lg flex items-center justify-center">
                  <div className="flex items-center justify-center">
                    <img src={course} alt="Courses" className="lg:w-7 lg:h-7 3xl:w-12 3xl:h-12" loading="lazy" />
                  </div>
                </div>
                <h3 className="font-semibold lg:text-[10px] xl:text-sm 2xl:text-base text-gray-900 mb-2 text-center">Courses</h3>
                <p className="lg:text-[8px] xl:text-sm text-gray-600 lg:mb-2 3xl:mb-4 text-center">Access a wide array of meticulously crafted courses.</p>
                <div className="flex items-center justify-center">
                  <button className="bg-[#8A63FF] flex items-center align-center text-white px-4 py-2 rounded-3xl lg:text-[8px] xl:text-sm 2xl:text-base hover:bg-opacity-85"
                    onClick={() => toNavigation('/course')}>
                    Courses
                  </button>
                </div>
              </div>

              {/* 100K+ Card */}
              <div className="w-[70%] bg-white rounded-3xl p-1 shadow-2xl mt-6">
                <div className="flex items-center gap-2 lg:p-1 3xl:p-4">
                  <div className="rounded-lg w-fit">
                    <img src={global} alt="Global" className="lg:w-7 h-7 xl:w-12 3xl:w-12 3xl:h-12" loading="lazy" />
                  </div>
                  <div className="flex items-start justify-start flex-col">
                    <div className="lg:text-[10px] xl:text-sm 2xl:text-[1.25rem] font-semibold text-gray-900 text-left">100K+</div>
                    <p className="lg:text-[8px] xl:text-sm text-gray-600 text-left">Join 100,000+ learners globally.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Video Container with 9:16 aspect ratio - LARGER for desktop */}
            <div className="flex justify-center items-center h-full py-4">
              <div className="w-full md:w-[75%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] max-w-[450px] mx-auto rounded-3xl overflow-hidden shadow-2xl">
                {/* Using padding-bottom technique for 9:16 aspect ratio (177.78% = 16/9 * 100%) */}
                <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
                  <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    poster={star} // Use image as poster until video loads
                    loop
                    controls
                    preload="metadata"
                    onLoadedData={() => setVideoLoaded(true)}
                    onError={(e) => {
                      console.error("Error loading video:", e);
                      e.currentTarget.poster = "https://via.placeholder.com/320x480";
                    }}
                  >
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            {/* Right Cards Column */}
            <div className="flex flex-col justify-start h-full pt-[20%] gap-6 items-start">
              {/* Opportunities Card */}
              <div className="w-[70%] bg-white rounded-xl lg:p-3 xl:p-4 3xl:p-6 shadow-2xl mb-6 flex">
                <div className="p-1 flex justify-center items-center rounded-lg w-fit">
                  <img src={opp} alt="Opportunities" className="lg:w-7 lg:h-7 3xl:w-12 3xl:h-12" loading="lazy" />
                </div>
                <div className="flex justify-center items-center">
                  <h3 className="font-semibold text-gray-900 lg:text-[10px] xl:text-sm 2xl:text-[1.25rem]">Opportunities</h3>
                </div>
              </div>

              {/* Learning Card */}
              <div className="w-[70%] bg-white rounded-2xl lg:p-3 xl:p-4 3xl:p-6 shadow-2xl">
                <div className="p-1 rounded-lg flex items-center justify-center">
                  <div className="flex items-center justify-center">
                    <img src={learn} alt="Learning" className="lg:w-7 lg:h-7 3xl:w-12 3xl:h-12" loading="lazy" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center lg:text-[10px] xl:text-sm 2xl:text-[1.25rem]">Learning</h3>
                <p className="text-gray-600 text-center lg:text-[8px] xl:text-sm">Engage with interactive content, expert instructors.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhyChoose;

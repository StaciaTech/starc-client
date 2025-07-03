import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, BadgeCheck, Code2, Users, Sparkle } from 'lucide-react'; // Ensure all icons are imported
import Purplegradient from "../Assets/Purplegradient.png"

// Assuming these paths are correct relative to your project structure
// and that your bundler (e.g., Vite, Create React App, Next.js) handles them.
import girlpic from "../Assets/girl.jpg";
import avatars from "../Assets/avatar.jpg";
import chicks from "../Assets/chick.jpg";
import boyz from "../Assets/boy.jpg";

type Step = {
  number: string;
  icon: JSX.Element;
  title: string;
  description: string;
  bgColor: string;
};

const steps: Step[] = [
  {
    number: '01',
    icon: <ArrowLeft className="text-blue-500 w-5 h-5" />,
    title: 'Sign Up and create Account',
    description: 'Register quickly and customize your profile',
    bgColor: 'bg-blue-50',
  },
  {
    number: '02',
    icon: <Upload className="text-orange-500 w-5 h-5" />,
    title: 'Expression of interest',
    description: 'Explore courses and mark interest.',
    bgColor: 'bg-orange-50',
  },
  {
    number: '03',
    icon: <BadgeCheck className="text-purple-500 w-5 h-5" />,
    title: 'Get Discovered',
    description: 'Highlight your skills and progress in our network.',
    bgColor: 'bg-purple-50',
  },
  // Added more steps to make the scroll effect noticeable
  {
    number: '04',
    icon: <Code2 className="text-green-500 w-5 h-5" />,
    title: 'Start Learning',
    description: 'Access exclusive courses and content.',
    bgColor: 'bg-green-50',
  },
  {
    number: '05',
    icon: <Users className="text-red-500 w-5 h-5" />,
    title: 'Join Community',
    description: 'Connect with other learners and experts.',
    bgColor: 'bg-red-50',
  },
  {
    number: '06',
    icon: <Sparkle className="text-yellow-500 w-5 h-5" />,
    title: 'Achieve Goals',
    description: 'Complete milestones and get certified.',
    bgColor: 'bg-yellow-50',
  },
];

const HowItWorks = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [imagesLoaded, setImagesLoaded] = useState(false);

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
  const isMobile = deviceType === 'mobile';
  // Determine if tablet-specific adjustments are needed
  const isTablet = deviceType === 'tablet';

  // Handle image loading
  useEffect(() => {
    const images = [girlpic, avatars, chicks, boyz, Purplegradient];
    let loadedCount = 0;
    
    const preloadImage = (src: string): Promise<void> => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === images.length) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = () => resolve(); // Continue even if an image fails to load
        img.src = src;
      });
    };
    
    images.forEach(src => preloadImage(src));
  }, []);

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="w-[90%] md:w-[80%] mx-auto px-2 sm:px-4 lg:px-1">
        {/* Main heading */}
        <h2 className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-mont font-medium text-gray-900 mb-6 md:mb-10 lg:mb-16 text-center md:text-left">
          How It Works
        </h2>

        <div className={`flex flex-col ${isTablet ? 'md:h-auto' : 'md:h-[60vh]'} lg:flex-row justify-between items-center md:items-start gap-6 md:gap-1`}>
          {/* Left Side Steps Container */}
          <div className={`w-full lg:w-1/2 h-auto ${isTablet ? 'md:h-auto md:max-h-[600px]' : 'md:h-[100%]'} relative`}>
            {/* Background gradient - hidden on mobile for better performance */}
            <img 
              src={Purplegradient}
              className={`inset-0 absolute hidden md:block ${isTablet ? 'md:opacity-30' : ''}`}
              loading="lazy"
              alt=""
            />
            
            {/* Scrollable container for steps */}
            <div
              className={`space-y-6 md:space-y-10 lg:space-y-14 max-h-[500px] ${isTablet ? 'md:max-h-[550px]' : 'md:h-[100%]'} w-full overflow-y-auto pr-2 md:pr-6 lg:pr-11 pl-2 md:pl-4`}
              style={{
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {/* Scrollbar styles */}
              <style>{`
                .steps-container::-webkit-scrollbar {
                  width: 6px;
                }
                .steps-container::-webkit-scrollbar-track {
                  background: #F0F0F0;
                  border-radius: 4px;
                }
                .steps-container::-webkit-scrollbar-thumb {
                  background: #888;
                  border-radius: 4px;
                }
                .steps-container::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
              `}</style>

              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-center w-full mb-6 md:mb-0"
                >
                  {/* Step Number - Hidden on mobile, shown on larger screens */}
                  <div
                    className={`hidden md:block absolute font-mont text-purple-300 select-none text-[300%] md:text-[400%] lg:text-[500%] leading-[100%] tracking-[0.03em] ${index % 2 === 0 ? 'left-[-15px]' : 'right-[-15px]'} top-1/2 -translate-y-1/2 z-0 ${isTablet ? 'opacity-30' : 'opacity-100'}`}
                  >
                    {step.number}
                  </div>

                  {/* Card Content */}
                  <div
                    className={`flex items-center gap-4 px-4 md:px-6 py-4 md:py-6 w-full ${isTablet ? 'md:w-[90%]' : 'md:w-[80%]'} rounded-[20px] border border-gray-200 bg-white shadow-md md:shadow-lg relative z-10 transition-transform duration-300 hover:scale-[1.01] md:hover:scale-[1.02] ${isMobile ? '' : (index % 2 === 0 ? 'md:translate-x-[40px] lg:translate-x-[60px]' : 'md:-translate-x-[40px] lg:-translate-x-[60px]')}`}
                  >
                    {/* Step number for mobile */}
                    <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold">
                      {step.number}
                    </div>
                    
                    <div className={`${step.bgColor} rounded-full p-2 shadow`}>
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm md:text-base lg:text-base xl:text-lg text-gray-800">{step.title}</h4>
                      <p className="text-xs md:text-sm lg:text-sm xl:text-base text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Image + Avatars */}
          <div className={`w-full lg:w-1/2 h-auto ${isTablet ? 'md:h-auto' : 'md:h-[100%]'} flex flex-col justify-between items-center lg:items-end p-2 md:p-4 lg:p-0 mt-8 md:mt-0`}>
            {/* Image grid - simplified for mobile */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full ${!imagesLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>
              {/* First column */}
              <div className={`h-auto ${isTablet ? 'md:h-[50vh]' : 'md:h-[60vh]'} relative`}>
                <div className={`h-[250px] ${isTablet ? 'md:h-[60%]' : 'md:h-[70%]'} flex items-end justify-center md:justify-end`}>
                  <img
                    src={girlpic}
                    alt="Student working"
                    className="object-cover w-full md:w-[70%] h-full rounded-[20px]"
                    loading="lazy"
                  />
                </div>

                {/* User stats overlay - positioned better for mobile */}
                <div className="flex justify-center md:justify-end mt-4 md:mt-0">
                  <div className={`w-fit z-10 md:absolute ${isTablet ? 'md:left-[30%] md:top-[65%]' : 'md:left-[40%] md:top-[75%] lg:left-[55%] lg:top-[70%]'}`}>
                    <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3 shadow-md w-fit">
                      <div className="flex -space-x-2">
                        {[avatars, chicks, boyz].map((src, index) => (
                          <img
                            key={index}
                            src={src}
                            alt={`User ${index + 1}`}
                            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-full border-2 border-white object-cover"
                            loading="lazy"
                          />
                        ))}
                      </div>
                      <div className="text-xs md:text-sm font-semibold text-blue-600">
                        10K+<br /> <span className="text-gray-700 font-normal">Job Seekers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second column - hidden on mobile to save space */}
              <div className={`hidden md:block ${isTablet ? 'md:h-[50vh]' : 'md:h-[60vh]'}`}>
                <img
                  src={girlpic}
                  alt="Student 2"
                  className="object-cover w-full h-[100%] rounded-[20px]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
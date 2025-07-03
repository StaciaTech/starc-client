import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../Assets/hero.png"; // Ensure this path is correct
import { motion } from "framer-motion";
import { TypingAnimation } from "@/components/magicui/typing-animation";

interface Slide {
  title: string;
  description: string;
}

const Hero: React.FC = () => {
  const slides: Slide[] = [
    {
      title: "Unlock Your Potential. Learn Without Limits.",
      description:
        "Access a world of knowledge. Flexible learning built for your success journey",
    },
    {
      title: "Grow Smarter. Learn Faster.",
      description:
        "Learn your way. Expert courses. Full support. Your pace.",
    },
    {
      title: "Accelerate Your Skills. Build Your Future.",
      description:
        "Master cutting-edge topics. Gain certifications for career advancement.",
    },
  ];
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [skipTransition, setSkipTransition] = useState(false);
  const [resetTyping, setResetTyping] = useState(0);

  // Auto-shift to the next slide every 5 seconds
  useEffect(() => {
    const interval = 5000; // 5 seconds to allow for typing animation
    const slideTimer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        if (prevSlide === slides.length - 1) {
          setSkipTransition(true); // Disable sliding for reset
          setTimeout(() => setSkipTransition(false), 0); // Re-enable transition
          setResetTyping(prev => prev + 1); // Trigger typing animation reset
          return 0; // Jump to first slide
        }
        setResetTyping(prev => prev + 1); // Trigger typing animation reset
        return (prevSlide + 1) % slides.length;
      });
    }, interval);

    return () => clearInterval(slideTimer); // Cleanup interval on unmount
  }, [slides.length]);

  // Handle click on the progress bar to switch slides
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - bar.left;
    const barWidth = bar.width;
    const sectionWidth = barWidth / slides.length;
    const clickedSection = Math.floor(clickX / sectionWidth);
    setCurrentSlide(clickedSection);
    setResetTyping(prev => prev + 1); // Trigger typing animation reset
    setSkipTransition(false); // Ensure normal transition on click
  };

  return (
    <section className="relative overflow-hidden min-h-[100vh] sm:min-h-[85vh] md:min-h-[90vh] lg:min-h-[95vh] xl:min-h-[95vh] 2xl:min-h-[95vh] 3xl:min-h-[90vh] w-full bg-gradient-to-b from-purple-50/30 to-white/80">
      {/* Subtle background pattern with enhanced opacity */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgeT0iMSIgcj0iMSIgZmlsbD0iIzAwMDAwMDMzIi8+PC9zdmc+')] bg-repeat"></div>
      </div>

      {/* Decorative elements - Enhanced for desktop but with size limits */}
      <div className="absolute top-10 left-5 w-24 h-24 sm:top-20 sm:left-10 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52 2xl:w-56 2xl:h-56 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-20 right-5 w-24 h-24 sm:top-40 sm:right-10 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52 2xl:w-56 2xl:h-56 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 sm:bottom-40 sm:left-1/3 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52 2xl:w-56 2xl:h-56 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center py-16 sm:pt-8 md:pt-5 lg:pt-0 xl:pt-0 2xl:pt-0 3xl:pt-0">
        <div className="relative w-full max-w-[920px] sm:max-w-[500px] md:max-w-[550px] lg:max-w-[500px] xl:max-w-[500px] 2xl:max-w-[500px] 3xl:max-w-[100px] flex flex-col justify-center items-center">
          
          {/* Hero Image - Size capped for desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full relative z-0"
          >
            <img
              src={heroImage}
              alt="Hero"
              className="w-full h-auto object-contain pt-45 sm:pt-32 md:pt-40 lg:pt-40 xl:pt-44 2xl:pt-44 
                         scale-[1.4] sm:scale-[1.3] md:scale-[1.4] lg:scale-[1.45] xl:scale-[1.5] 2xl:scale-[1.5] 
                         absolute top-12 left-0 lg:top-0 xl:top-0 z-0"
              loading="eager"
            />
          </motion.div>
          
          {/* Hero Content - Fixed positioning for desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col relative z-10 justify-center items-center mx-auto 
                       mt-48 sm:mt-52 md:mt-60 lg:mt-72 xl:mt-80 2xl:mt-80 3xl:mt-80 text-center"
          >
            {/* Badge - Size capped for desktop */}
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-[100px] sm:w-[120px] md:w-[130px] lg:w-[150px] xl:w-[160px] 2xl:w-[160px] 3xl:w-[160px] 
                         h-[25px] sm:h-[28px] md:h-[30px] lg:h-[35px] xl:h-[38px] 2xl:h-[38px] 3xl:h-[38px] 
                         flex justify-center items-center bg-[#8A63FF] text-white 
                         text-[8px] sm:text-[9px] md:text-[10px] lg:text-[12px] xl:text-[13px] 2xl:text-[13px] 3xl:text-[13px] 
                         font-semibold rounded-full mb-3 sm:mb-4 lg:mb-6 xl:mb-6 shadow-md"
            >
              SUPERVISED COURSES
            </motion.span>
            
            {/* Title with Typing Animation - Size capped for desktop */}
            <div className="min-h-[4rem] sm:min-h-[6rem] lg:min-h-[8rem] xl:min-h-[8rem] 2xl:min-h-[8rem] 
                           mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-5 px-2 lg:px-4">
              <TypingAnimation
                key={`${currentSlide}-${resetTyping}`}
                duration={50}
                delay={300}
                startOnView={false}
                className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-5xl 3xl:text-5xl 
                           font-bold text-[#474747] leading-tight tracking-tight"
              >
                {slides[currentSlide].title}
              </TypingAnimation>
            </div>
            
            {/* Description - Size capped for desktop */}
            <motion.p 
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg 3xl:text-lg 
                         text-[#474747] leading-relaxed 
                         max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-2xl 2xl:max-w-2xl 3xl:max-w-2xl 
                         mx-auto px-9 lg:px-0 font-medium"
            >
              {slides[currentSlide].description}
            </motion.p>
          </motion.div>
          
          {/* Call to Action - Size capped for desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row relative z-10 items-center justify-center 
                      gap-3 sm:gap-4 lg:gap-5 xl:gap-5 
                      mt-4 sm:mt-8 lg:mt-8 xl:mt-8 2xl:mt-8 
                      mb-6 sm:mb-12 font-mont"
          >
            {currentSlide === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/course')}
                  className="bg-[#8A63FF] text-white 
                           px-4 sm:px-5 md:px-6 lg:px-6 xl:px-7 2xl:px-7 
                           py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-2 2xl:py-2 
                           text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base 
                           font-medium rounded-lg shadow-lg hover:bg-[#7550e3] 
                           transition-all duration-300 w-full sm:w-auto 
                           hover:scale-105 transform"
                  style={{ boxShadow: '0px 8px 20px rgba(138, 99, 255, 0.35)' }}
                >
                  Explore More Now
                </button>
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-3 xl:gap-3 mt-3 sm:mt-0">
                  <div className="flex -space-x-2 sm:-space-x-3 lg:-space-x-3 xl:-space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.img
                        key={i}
                        whileHover={{ y: -3, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-10 xl:h-10 2xl:w-10 2xl:h-10 
                                 rounded-full border-2 border-white shadow-md"
                        src={`https://i.pravatar.cc/32?img=${i}`}
                        alt={`Student ${i}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg text-gray-600 font-medium">
                    1k+ students
                  </span>
                </div>
              </>
            ) : currentSlide === 1 ? (
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="bg-[#8A63FF] text-white 
                         px-4 sm:px-5 md:px-6 lg:px-6 xl:px-7 2xl:px-7 
                         py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-2 2xl:py-2 
                         text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base 
                         font-medium rounded-lg shadow-lg hover:bg-[#7550e3] 
                         transition-all duration-300 w-full sm:w-auto 
                         hover:scale-105 transform"
                style={{ boxShadow: '0px 8px 20px rgba(138, 99, 255, 0.35)' }}
              >
                Express Your Interest Now
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-5 xl:gap-5">
                <button
                  type="button"
                  onClick={() => navigate('/course')}
                  className="bg-[#8A63FF] text-white 
                           px-4 sm:px-5 md:px-6 lg:px-6 xl:px-7 2xl:px-7 
                           py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-2 2xl:py-2 
                           text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base 
                           font-medium rounded-lg shadow-lg hover:bg-[#7550e3] 
                           transition-all duration-300 w-full sm:w-auto 
                           hover:scale-105 transform"
                  style={{ boxShadow: '0px 8px 20px rgba(138, 99, 255, 0.35)' }}
                >
                  Explore Courses Now
                </button>
                <div className="flex items-center gap-2 lg:gap-3 xl:gap-3 
                              text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base 
                              text-gray-600 mt-3 sm:mt-0 
                              bg-white/80 px-3 sm:px-4 lg:px-4 xl:px-4 
                              py-1.5 sm:py-2 lg:py-1.5 xl:py-1.5 
                              rounded-full shadow-sm">
                  <span className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl 2xl:text-xl">📚</span>
                  <span className="font-medium">300+ Modules & 30+ Courses</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Animated progress bar - Size capped for desktop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center w-full mb-4 sm:mb-0"
          >
            <div
              className="w-32 sm:w-48 md:w-56 lg:w-64 xl:w-72 2xl:w-72 
                       h-1 sm:h-1.5 md:h-2 lg:h-2 xl:h-2 
                       bg-gray-200 rounded-full overflow-hidden cursor-pointer shadow-sm"
              onClick={handleBarClick}
            >
              <div
                className="h-full bg-[#8A63FF] rounded-full"
                style={{
                  width: `${100 / slides.length}%`,
                  transform: `translateX(${currentSlide * 100}%)`,
                  transition: skipTransition ? "none" : "transform 0.5s ease-in-out",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <style>
        {`
          @keyframes popSlide {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-pop-slide {
            animation: popSlide 0.5s ease-in-out forwards;
          }
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          /* Enhanced animations for desktop */
          @media (min-width: 1024px) {
            .animate-blob {
              animation: blob 15s infinite;
            }
            @keyframes blob {
              0% {
                transform: translate(0px, 0px) scale(1);
              }
              33% {
                transform: translate(50px, -80px) scale(1.2);
              }
              66% {
                transform: translate(-40px, 40px) scale(0.8);
              }
              100% {
                transform: translate(0px, 0px) scale(1);
              }
            }
          }
        `}
      </style>
    </section>
  );
};

export default Hero;

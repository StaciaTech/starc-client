import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CoursesSection from "@/components/coursessection";
import PurpleBox from "@/components/PurpleBox";
import WhyChoose from "@/components/WhyChoose";
import Masters from "@/components/Masters";
import HowItWorks from "@/components/HowItWorks";
import TopMentors from "@/components/TopMentors";
import FAQ from "@/components/FAQ";
import WallOfLove from "@/components/WallOfLove";
import Footer from "@/components/Footer";

const Index = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Render components in different order for mobile
  const renderContent = () => {
    if (isMobile) {
      return (
        <>
          <Hero />
          <CoursesSection />
          
          <div className="flex justify-center text-center flex-col font-mont pt-[5%]">
            <div className="text-center mb-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mont font-medium text-gray-900 mb-4">Why Choose Edifai?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto px-4 text-sm sm:text-base">
                At Edifai, we're dedicated to providing an unparalleled learning
                experience that equips you for success in today's dynamic world.
              </p>
            </div>
            <WhyChoose />
          </div>
          <HowItWorks />
          <TopMentors />
          <FAQ />
          <WallOfLove />
          <div className="flex justify-center text-start">
            <PurpleBox />
          </div>
        </>
      );
    } else {
      return (
        <>
          <Hero />
          <CoursesSection />
          <div className="flex justify-center text-center flex-col font-mont pt-[5%]">
            <div className="text-center mb-1">
              <h2 className="lg:text-4xl xl:text-5xl 3xl:text-5xl font-mont font-medium text-gray-900 mb-4">Why Choose Edifai?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto items-center">
                At Edifai, we're dedicated to providing an unparalleled learning
                experience that equips you for success in today's dynamic world.
              </p>
            </div>
            <WhyChoose />
          </div>
          <HowItWorks />
          <TopMentors />
          <FAQ />
          <WallOfLove />
          <div className="flex justify-center text-start">
            <PurpleBox />
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {renderContent()}
      <Footer />
    </div>
  );
};

export default Index;

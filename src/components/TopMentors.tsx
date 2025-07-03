import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react'; // Only import Star since that's what we're using
import courseService, { IMentor } from '@/services/courseService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// --- Data Interfaces ---
interface Mentor {
  id: number;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviews: number;
  image: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// --- Mentor Section Data ---

const mentors: Mentor[] = [
  {
    id: 1,
    name: "Vikram Varma V",
    specialization: "Front-End Associate",
    experience: "2 Years",
    rating: 5,
    reviews: 200,
    image: "/mentors/vikram.jpg"
  },
  
  {
    id: 3,
    name: "Prem",
    specialization: "IOT Integration",
    experience: "1 Years",
    rating: 5,
    reviews: 200,
    image: "/mentors/prem.jpg"
  }
];

// --- FAQ Section Data ---
const faqs: FaqItem[] = [
  {
    id: '1',
    question: 'Why do I need to use a Design System?',
    answer: 'A Design System is a super useful tool for designers. It helps keep designs consistent and makes the design process faster. You can use pre-designed stuff over and over, and it\'s helpful for both new and experienced designers. In short, a Design System is like a designer\'s toolbox for making great-looking and user-friendly designs.',
  },
  {
    id: '2',
    question: 'Is there a preview or a free trial available?',
    answer: 'Yes, we offer a demo version that allows you to explore the core features. Contact our sales team for more details on trial periods and enterprise solutions.',
  },
  {
    id: '3',
    question: 'Where can I purchase AlignUI Design System?',
    answer: 'AlignUI Design System can be purchased directly from our official website or through our authorized resellers. Please visit our pricing page for more information.',
  },
  {
    id: '4',
    question: 'What are the recent updates and enhancements in AlignUI?',
    answer: 'We regularly update AlignUI with new features, components, and improvements. You can find a detailed changelog on our documentation page or subscribe to our newsletter for release announcements.',
  },
  {
    id: '5',
    question: 'How do I install AlignUI Design System in Figma?',
    answer: 'Installing AlignUI Design System in Figma is straightforward. Simply download the Figma file from your purchase confirmation, then import it into your Figma account. Detailed instructions are available in our getting started guide.',
  },
];

// --- Helper Component: StarRating (for Mentors) ---
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center space-x-0.5 text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < Math.round(rating) ? "fill-yellow-400 stroke-yellow-400" : "stroke-yellow-400"}`} 
        />
      ))}
    </div>
  );
};

// --- Main Component ---
const TopMentors: React.FC = () => {
  const [mentors, setMentors] = useState<IMentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const navigate = useNavigate();

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

  // Define a type for extended mentor data to handle additional fields
  type ExtendedMentor = IMentor & {
    specialization?: string;
    courses?: any[];
    reviews?: any[];
  };

  // Function to get mentor profile image
  const getMentorProfileImage = (mentorName: string): string => {
    // Convert name to lowercase and remove spaces for filename
    const formattedName = mentorName.toLowerCase().split(' ')[0];
    
    // Check for specific mentors and return their images
    if (formattedName.includes('vikram')) {
      return '/mentors/vikram.png';
    } else if (formattedName.includes('ganesh')) {
      return '/mentors/ganesh.png';
    } else if (formattedName.includes('prem')) {
      return '/mentors/prem.png';
    }
    
    // Default fallback image
    return '/placeholder-avatar.jpg';
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const data = await courseService.getMentors();
        
        if (!data || !Array.isArray(data)) {
          console.error("Invalid mentor data received:", data);
          setMentors([]);
          toast.error("Failed to fetch mentors data. Please try again later.");
          return;
        }
        
        // Transform the data to include specialization field
        const extendedData = data.map((mentor) => ({
          ...mentor,
          specialization: mentor.expertise?.length > 0 ? mentor.expertise[0] : 'Instructor',
          courses: [], // Default empty array
          reviews: [] // Default empty array
        }));
        setMentors(extendedData as IMentor[]);
      } catch (error) {
        console.error("Error fetching mentors:", error);
        toast.error("Failed to fetch mentors. Please try again later.");
        setMentors([]); // Set empty array to prevent undefined errors
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // Determine if tablet-specific adjustments are needed
  const isTablet = deviceType === 'tablet';
  const isMobile = deviceType === 'mobile';

  return (
    <div className="font-mont pb-10 md:pb-16 lg:pb-20">
      {/* --- Top Mentors Section --- */}
      <section className={`py-10 ${isTablet ? 'md:py-12' : 'md:py-16'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Header Section */}
          <div className={`mb-8 ${isTablet ? 'md:mb-10' : 'md:mb-12'}`}>
            <h2 className={`text-3xl ${isTablet ? 'md:text-4xl' : 'lg:text-4xl xl:text-[56px]'} font-mont font-medium text-gray-900 mb-3 md:mb-4`}>
              Our Top Mentors At Edifai
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Welcome to our platform, enhancing your skills. Welcome to our platform, enhancing your skills.
            </p>
          </div>

          {/* Mentor Cards - Single Row with Circular Images */}
          {loading ? (
            <div className="flex justify-center items-center py-8 md:py-10">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : mentors.length > 0 ? (
            <div className={`flex flex-wrap ${isMobile ? 'justify-center' : 'justify-center'} gap-8 md:gap-12 lg:gap-16`}>
              {mentors.slice(0, 4).map((mentor) => { // Limit to 4 mentors for better display
                // Cast to extended type to access additional fields
                const extendedMentor = mentor as ExtendedMentor;
                // Get mentor profile image from /public/mentors/ directory
                const profileImage = getMentorProfileImage(mentor.name);
                
                return (
                  <div
                    key={mentor._id}
                    className="flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => navigate(`/mentor/${mentor._id}`)}
                  >
                    {/* Circular Profile Image */}
                    <div className="mb-4 relative">
                      <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                          src={profileImage}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.src = "/placeholder-avatar.jpg";
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Mentor Info */}
                    <div className="text-center">
                      <h3 className="text-xl font-medium text-gray-900 mb-1">
                        {mentor.name}
                      </h3>
                      <p className="text-gray-500 mb-2">{extendedMentor.specialization || mentor.expertise?.[0] || 'Instructor'}</p>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 md:py-10 bg-gray-50 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold">No mentors found</h3>
              <p className="text-gray-500 mt-2">
                Check back later for updates on our mentor team
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TopMentors;

import React, { useState, useEffect } from 'react';
import WallOfLove from './WallOfLove';
import PurpleBox from './PurpleBox';
import Footer from './Footer';
import Backarrow from '../Assets/back.png';
import Behance from '../Assets/ion_logo-behance.png';
import linkedin from '../Assets/mdi_linkedin.png';
import resume from '../Assets/pepicons-print_cv.png';
import interview from '../Assets/interview.png';
import coc from '../Assets/Group 18504.png';
import reference from '../Assets/Group 18499.png';
import skill from '../Assets/Group 18500.png';
import mentor from '../Assets/Group 18501.png';
import human from '../Assets/human.png';
import frame from '../Assets/Frame.png';
import { useNavigate, useParams } from 'react-router-dom';
import Enroll from './Enroll';
import { IoArrowBack } from 'react-icons/io5'; // Importing the left arrow icon
import Navbar from './Navbar';
import SubmissionSuccess from './SubmissionSuccess';
import courseService, { ICourse } from '@/services/courseService';
import { getEnrolledCourses } from '@/services/profileService';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const CardDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) {
        console.error('Course ID is undefined or null');
        setError('Course ID not found in URL parameters');
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching course with ID: ${id}`);
        setLoading(true);
        const courseData = await courseService.getCourseById(id);
        
        if (!courseData) {
          console.error('Course data is empty or undefined');
          setError('Course not found');
          setLoading(false);
          return;
        }
        
        console.log('Course data fetched successfully:', courseData);
        setCourse(courseData);
        
        // Check if user is already enrolled
        try {
          setCheckingEnrollment(true);
          const enrolledCourses = await getEnrolledCourses();
          const enrolled = enrolledCourses.some((course: any) => course.id === id);
          console.log('User enrollment status:', enrolled ? 'Enrolled' : 'Not enrolled');
          setIsEnrolled(enrolled);
        } catch (enrollmentErr) {
          console.error('Error checking enrollment status:', enrollmentErr);
          // If we can't check enrollment, assume not enrolled
          setIsEnrolled(false);
        } finally {
          setCheckingEnrollment(false);
        }
      } catch (err: any) {
        console.error('Error fetching course details:', err);
        
        // More detailed error handling
        if (err.response) {
          console.error('Response error:', err.response.status, err.response.data);
          
          if (err.response.status === 404) {
            setError('Course not found. It may have been deleted or moved.');
          } else {
            setError(`Failed to load course details: ${err.response.data.message || 'Server error'}`);
          }
        } else if (err.request) {
          console.error('Request error - no response received:', err.request);
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Failed to load course details. Please try again.');
        }
        
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate('/course');
  };

  // Add this function to handle continue learning
  const handleContinueLearning = () => {
    navigate(`/course/${id}/learn`);
  };

  // Add this function to navigate to assignments
  const handleViewAssignments = () => {
    navigate(`/course/${id}/assignments`);
  };

  if (loading) {
    return (
      <div className="flex-col min-h-screen bg-gray-50 font-mont">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="mt-4 text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex-col min-h-screen bg-gray-50 font-mont">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">
              {error || 'Course not found'}
            </div>
            <button
              onClick={handleGoBack}
              className="bg-[#8A63FF] text-white px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format duration from minutes to a readable format
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${mins} minute${mins > 1 ? 's' : ''}`;
    }
  };

  // Calculate discounted price if applicable
  const discountedPrice = course.discount 
    ? course.price - (course.price * (course.discount / 100)) 
    : course.price;

  return (
    <div className="flex-col min-h-[800px] bg-gray-50 font-mont">
      <Navbar/>
      
      {/* Mobile Enrollment Sticky Button (only visible on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-3 shadow-lg z-50 border-t border-gray-200">
        <Button
          onClick={isEnrolled ? handleContinueLearning : handleDirectEnroll}
          className="w-full bg-[#8A63FF] text-white py-3 rounded-lg font-semibold hover:bg-[#7A53EF] transition"
        >
          {isEnrolled ? "Continue Learning" : "Enroll Now"}
        </Button>
      </div>

      {/* Flex Row for Main Content and Enroll Sidebar */}
      <div className="flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3 p-4 lg:p-20">
          {/* Supervised Course Tag with Back Arrow */}
          <div className="mb-4 flex flex-wrap items-center gap-2 lg:gap-3">
            
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="flex items-center bg-[#8A63FF] text-white text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full hover:bg-[#6D28D9] transition"
            >
              <IoArrowBack className="mr-1" />
              Back
            </button>
            {/* Supervised Course Tag */}
            <span className="inline-block bg-[#8A63FF] text-white text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full">
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)} Level
            </span>
            {course.category && (
              <span className="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-1 rounded-full">
                {course.category}
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-2xl lg:text-4xl font-bold text-black mb-4 lg:mb-6">{course.title}</h1>

          {/* Description */}
          <p className="text-gray-600 text-sm lg:text-base mb-6 lg:mb-8">
            {course.description}
          </p>

          {/* Course details */}
          <div className="flex flex-wrap items-center gap-3 mb-6 lg:mb-8 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-semibold mr-1">Duration:</span> {formatDuration(course.duration)}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">Rating:</span> {course.rating.toFixed(1)}/5
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">Students:</span> {course.enrolledUsers?.length || 0}
            </div>
          </div>

          {/* --------------- */}
          <div className="bg-white p-4 lg:p-16 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-lg">
            {/* What You'll Learn Section */}
            <div className="mb-6 lg:mb-8">
              <div className="grid grid-cols-1 mb-4 w-full">
                <h2 className="text-lg lg:text-xl font-semibold text-[#8A63FF]">What You'll Learn</h2>
                <p className="">{course.title} Fundamentals:</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-4">
                {course.lessons && course.lessons.length > 0 ? (
                  <ul className="space-y-3 lg:space-y-5 mb-4 md:mb-0">
                    {course.lessons.slice(0, Math.ceil(course.lessons.length / 2)).map((lesson, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm lg:text-base text-gray-600">
                        <div className="flex items-center justify-center">
                          <img src={frame} alt="" className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                        {lesson.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm lg:text-base">Lesson content will be available soon.</p>
                )}
                
                {course.lessons && course.lessons.length > 1 && (
                  <ul className="space-y-3 lg:space-y-5">
                    {course.lessons.slice(Math.ceil(course.lessons.length / 2)).map((lesson, index) => (
                      <li key={`second-${index}`} className="flex items-center text-sm lg:text-base text-gray-600">
                        <div className="flex items-center justify-center">
                          <img src={frame} alt="" className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                        {lesson.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-6 lg:mt-8 pt-6 lg:pt-8"></div>
            
            {/* Value Beyond the Classroom Section */}
            <div className="mb-6 lg:mb-8">
              <h2 className="text-lg lg:text-xl font-semibold text-[#8A63FF] mb-4">VALUE BEYOND THE CLASSROOM</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={Behance} alt="" className="w-12 h-10" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">Behance Profile</p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Showcase projects, collaborate, network
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={linkedin} alt="" className="w-12 h-10" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">LinkedIn Profile</p>
                  <p className="text-gray-500 text-xs lg:text-sm">Highlight skills, projects</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={resume} alt="" className="w-10 h-10" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">Resume Building</p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Master communication skills
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={interview} alt="" className="w-10 h-10" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">Interview Prep</p>
                  <p className="text-gray-500 text-xs lg:text-sm">Mock interviews, feedback</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-6 lg:mt-8 pt-6 lg:pt-8"></div>
            
            {/* What You'll Get Section */}
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-[#8A63FF] mb-4">What You'll Get</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={coc} alt="" className="w-10 h-10" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">Certificate</p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Validate your skills
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={reference} alt="" className="w-10 h-10" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">Reference Materials</p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Comprehensive resources
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={skill} alt="" className="w-10 h-10" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">Skill Assessment</p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Evaluate your expertise
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={mentor} alt="" className="w-10 h-10" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">Mentorship</p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Expert guidance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            {isEnrolled && (
              <>
                <Button 
                  onClick={handleContinueLearning}
                  className="bg-[#8A63FF] text-white hover:bg-[#7A53EF]"
                >
                  Continue Learning
                </Button>
                <Button 
                  onClick={handleViewAssignments}
                  variant="outline"
                  className="border-[#8A63FF] text-[#8A63FF] hover:bg-[#F5F0FF]"
                >
                  View Assignments
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Form Sidebar (Enroll Component) - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/3 items-start justify-center p-6 sticky top-0 h-screen overflow-y-auto">
          {checkingEnrollment ? (
            <div className="w-[100%] bg-white p-6 shadow-lg rounded-lg border border-[#8A63FF4D]">
              <div className="text-center py-10">
                <Spinner />
                <p className="text-gray-600">Checking enrollment status...</p>
              </div>
            </div>
          ) : isEnrolled ? (
            <div className="w-[100%] bg-white p-6 shadow-lg rounded-lg border border-[#8A63FF4D]">
              {/* Course Info Summary */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h2>
                <div className="flex items-center mb-2">
                  <span className="text-gray-600 text-sm">Instructor: </span>
                  <span className="text-gray-800 text-sm ml-1 font-medium">
                    {course.instructor?.name || 'Expert Instructor'}
                  </span>
                </div>
                <div className="flex items-center mb-4">
                  <span className="text-gray-600 text-sm">Status: </span>
                  <span className="text-green-600 text-sm ml-1 font-medium">Already enrolled</span>
                </div>
              </div>
              
              <Button
                onClick={handleContinueLearning}
                className="w-full bg-[#8A63FF] text-white py-3 rounded-lg font-semibold hover:bg-[#7A53EF] transition mb-4"
              >
                Continue Learning
              </Button>
            </div>
          ) : (
            <Enroll 
              courseId={course?._id || ''}
              title={course?.title || ''}
              price={course?.price || 0}
              discountedPrice={discountedPrice}
              discount={course?.discount}
              instructor={course?.instructor?.name || 'Expert Instructor'}
              duration={formatDuration(course?.duration || 0)}
              level={course?.level || 'beginner'}
            />
          )}
        </div>
      </div>

      {/* Other Components */}
      <WallOfLove />
      <div className="flex justify-center mb-20 lg:mb-0">
        <PurpleBox />
      </div>
      <Footer />
    </div>
  );
};

// Helper function for direct enrollment (to use in the mobile button)
const handleDirectEnroll = async () => {
  try {
    const courseId = window.location.pathname.split('/').pop();
    if (!courseId) return;
    
    await courseService.enrollInCourse(courseId);
    toast.success("Successfully enrolled in course!");
    window.location.href = `/course/${courseId}/learn`;
  } catch (error: any) {
    console.error("Error enrolling in course:", error);
    
    // Check if this is the "already enrolled" error
    if (error.response && error.response.status === 400 && 
        error.response.data && error.response.data.message === 'User already enrolled in this course') {
      toast.info("You're already enrolled in this course. Redirecting to learning page...");
      
      // Wait a moment to show the message before redirecting
      const courseId = window.location.pathname.split('/').pop();
      setTimeout(() => {
        window.location.href = `/course/${courseId}/learn`;
      }, 1500);
    } else {
      toast.error("Failed to enroll in course. Please try again.");
    }
  }
};

export default CardDetail;
"use client";

import React, { useState, useEffect } from "react";
import {
  Monitor,
  PenTool,
  Briefcase,
  Megaphone,
  Camera,
  BookOpen,
  Clock,
  ArrowRight,
  Star,
  Users,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import courseService, { ICourse } from "@/services/courseService";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Import images for course categories
import course1 from "../Assets/icons/course1.svg";
import course2 from "../Assets/icons/course2.svg";
import course3 from "../Assets/icons/course3.svg";
import course4 from "../Assets/icons/course4.svg";
import course5 from "../Assets/icons/course5.svg";
import course6 from "../Assets/icons/course6.svg";
import course7 from "../Assets/icons/course7.svg";
import course8 from "../Assets/icons/course8.svg";
import course9 from "../Assets/icons/course9.svg";
import defaultImage from "../Assets/icons/course1.svg";

// Course images mapping with descriptive objects
const courseImages = {
  development: course1,
  webdev: course1,
  software: course1,
  programming: course1,
  design: course2,
  uiux: course2,
  mechanical: course4,
  engineering: course4,
  autocad: course4,
  cad: course4,
  "3ddesign": course4,
  modeling: course4,
  iot: course3,
  electronics: course3,
  aiml: course5,
  "machine learning": course5,
  "data science": course5,
  devops: course6,
  cloud: course6,
  default: course1,
};

// Modern course card component
function CourseCard({ course, index }: { course: ICourse & { badge?: string }, index: number }) {
  const navigate = useNavigate();

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0 hours';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${mins} min`;
    }
  };

  // Enhanced image selection logic based on course content
  const getCourseImage = () => {
    const title = course.title ? course.title.toLowerCase() : '';
    const category = course.category ? course.category.toLowerCase() : '';
    
    // Software development related
    if (title.includes('software') || 
        title.includes('coding') || 
        title.includes('programming') ||
        title.includes('development') ||
        title.includes('web') ||
        title.includes('javascript') ||
        title.includes('react') ||
        title.includes('node') ||
        title.includes('python') ||
        title.includes('java') ||
        category.includes('software') ||
        category.includes('web') ||
        category.includes('development') ||
        category.includes('programming')) {
      return courseImages.development;
    }
    
    // UI/UX Design related
    if (title.includes('ui') ||
        title.includes('ux') ||
        title.includes('user interface') ||
        title.includes('user experience') ||
        title.includes('design') ||
        category.includes('design') ||
        category.includes('ui/ux')) {
      return courseImages.design;
    }
    
    // Mechanical engineering related
    if (title.includes('mechanical') || 
        title.includes('engineering') || 
        title.includes('physics') ||
        category.includes('mechanical') || 
        category.includes('engineering')) {
      return courseImages.mechanical;
    }
    
    // AutoCAD or 3D modeling related
    if (title.includes('autocad') || 
        title.includes('cad') || 
        title.includes('3d') || 
        title.includes('modeling') ||
        category.includes('cad') || 
        category.includes('autocad') || 
        category.includes('3d')) {
      return courseImages.autocad;
    }
    
    // AI/ML related
    if (title.includes('ai') || 
        title.includes('machine learning') || 
        title.includes('artificial intelligence') || 
        title.includes('data science') ||
        category.includes('ai') || 
        category.includes('ml') || 
        category.includes('data')) {
      return courseImages.aiml;
    }

    // IoT/Electronics related
    if (title.includes('iot') ||
        title.includes('internet of things') ||
        title.includes('electronics') ||
        title.includes('arduino') ||
        title.includes('raspberry pi') ||
        category.includes('iot') ||
        category.includes('electronics')) {
      return courseImages.iot;
    }

    // Use a random image as fallback
    const randomIndex = Math.floor(Math.random() * Object.values(courseImages).length);
    return Object.values(courseImages)[randomIndex];
  };

  // Never display the "AI Generated" badge
  const displayBadge = course.badge && course.badge !== "AI Generated";
  
  // Animation variants for staggered appearance
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: index * 0.1, // Stagger effect
      }
    },
    hover: {
      y: -8,
      boxShadow: "0 10px 25px rgba(138, 99, 255, 0.15)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 h-full transform transition-all"
      onClick={() => navigate(`/course/${course._id}`)}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      <div className="relative overflow-hidden">
        <img
          src={getCourseImage()}
          alt={course.title}
          className="w-full aspect-video object-cover transition-transform duration-700 hover:scale-110"
        />
        {displayBadge && (
          <span className="absolute top-3 left-3 bg-[#8A63FF] text-white text-xs font-bold py-1 px-2 rounded-full shadow-sm">
            {course.badge}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{course.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{formatDuration(course.duration)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 min-h-[2.5rem] mb-2">
          {course.title}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{course.rating || 4.5}</span>
          </div>
          
          <div className="flex items-center text-[#8A63FF] font-bold text-sm sm:text-base">
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Modern category data with icons
const categories = [
  { id: "all", label: "All Courses", icon: <Monitor className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: "IoT", label: "IoT", icon: <Monitor className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: "UI/UX", label: "UI/UX", icon: <PenTool className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: "Full Stack", label: "Full Stack", icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: "Mechanical", label: "Mechanical", icon: <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" /> }
];

export default function CoursesSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCourses, setVisibleCourses] = useState<number>(6);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourses();
        setCourses(data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses. Please try again later.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on the active category
  const filteredCourses = activeCategory === "all" 
    ? courses 
    : courses?.filter(course => course?.category === activeCategory) || [];

  // Show more courses on mobile
  const handleShowMore = () => {
    setVisibleCourses(prev => prev + 4);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="courses" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50/30">
      <motion.div 
        className="max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="text-center mb-8 sm:mb-16"
          variants={titleVariants}
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Explore Our <span className="text-[#8A63FF]">Top Courses</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our interactive courses taught by industry experts to boost your skills
          </p>
        </motion.div>

        {/* Category Pills - Enhanced mobile scrolling */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:gap-2 no-scrollbar">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 py-2 px-4 sm:px-5 rounded-full whitespace-nowrap mr-2 sm:mr-0 transition-all ${
                  activeCategory === category.id
                    ? "text-white bg-[#8A63FF] shadow-md shadow-purple-200"
                    : "text-gray-700 bg-white border border-gray-200 hover:border-[#8A63FF] hover:text-[#8A63FF]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{category.icon}</span>
                <span className="text-xs sm:text-base font-medium">{category.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63FF]"></div>
          </div>
        ) : filteredCourses?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredCourses.slice(0, visibleCourses).map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
            
            {visibleCourses < filteredCourses.length && (
              <motion.div 
                className="flex justify-center mt-6 sm:mt-8"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <button
                  onClick={handleShowMore}
                  className="flex items-center gap-2 py-2.5 px-6 bg-white border border-[#8A63FF] text-[#8A63FF] rounded-full hover:bg-[#8A63FF] hover:text-white transition-colors duration-300 shadow-sm"
                >
                  <span className="font-medium text-sm sm:text-base">Show More</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div 
            className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold text-gray-800">No courses found</h3>
            <p className="text-gray-500 mt-2 mb-6">
              No courses available in this category
            </p>
            <button 
              onClick={() => setActiveCategory('all')}
              className="px-6 py-2 bg-[#8A63FF] text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              View All Courses
            </button>
          </motion.div>
        )}

        <motion.div 
          className="flex justify-center mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/course"
            className="group flex items-center gap-2 py-2.5 sm:py-3 px-6 sm:px-8 rounded-full bg-[#8A63FF] text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200/50"
          >
            <span className="text-sm sm:text-base font-bold">Browse All Courses</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Add styles for hiding scrollbar but allowing scrolling */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, BookOpen, Star, Users } from "lucide-react";

// Import course images with better naming
import webDevImg from "../Assets/icons/course1.svg";
import designImg from "../Assets/icons/course2.svg";
import iotImg from "../Assets/icons/course3.svg";
import mechanicalImg from "../Assets/icons/course4.svg";
import aimlImg from "../Assets/icons/course5.svg";
import devopsImg from "../Assets/icons/course6.svg";
import threeDesignImg from "../Assets/icons/course4.svg"; // Using mechanical image for 3D design
import autocadImg from "../Assets/icons/course4.svg"; // Using mechanical image for AutoCAD

// Category to image mapping
const categoryImages = {
  "development": webDevImg,
  "web development": webDevImg,
  "software development": webDevImg,
  "design": designImg,
  "ui/ux": designImg, // Using existing design image
  "mechanical": mechanicalImg,
  "engineering": mechanicalImg,
  "autocad": mechanicalImg, // Using existing mechanical image
  "iot": iotImg,
  "electronics": iotImg,
  "ai": aimlImg,
  "ml": aimlImg,
  "data science": aimlImg,
  "devops": devopsImg,
  "cloud computing": devopsImg,
  "default": webDevImg // Fallback image
};

export interface Course {
  image: string;
  title: string;
  instructor: string;
  // description: string;
  rating: number;
  students: number;
  duration: string;
  lessons: number;
  price: number;
  originalPrice: number;
  badge?: string;
  category?: string;
  _id?: string;
  driveUrl?: string; // For books
  type?: string;
  topic?: string;
  pages?: number;
}

interface CardProps {
  course: Course;
}

const Recard: React.FC<CardProps> = ({ course }) => {
  const navigate = useNavigate();
  const titleLower = course.title ? course.title.toLowerCase() : '';
  const categoryLower = course.category ? course.category.toLowerCase() : '';
  const isBookOrPDF = course.type === 'book' || course.driveUrl || course.pages;

  // Determine the appropriate image based on course content
  const getImage = () => {
    // Check for software-related keywords
    if (
      titleLower.includes('software') ||
      titleLower.includes('programming') ||
      titleLower.includes('coding') ||
      titleLower.includes('development') ||
      titleLower.includes('web') ||
      titleLower.includes('python') ||
      titleLower.includes('java') ||
      titleLower.includes('javascript') ||
      categoryLower.includes('development') ||
      categoryLower.includes('programming')
    ) {
      return webDevImg;
    }
    
    // UI/UX Design related
    if (titleLower.includes('ui') ||
        titleLower.includes('ux') ||
        titleLower.includes('user interface') ||
        titleLower.includes('user experience') ||
        titleLower.includes('design') ||
        categoryLower.includes('design') ||
        categoryLower.includes('ui/ux')) {
      return designImg;
    }
    
    // Mechanical Engineering related
    if (titleLower.includes('mechanical') ||
        titleLower.includes('engineering') ||
        titleLower.includes('machine') ||
        titleLower.includes('physics') ||
        categoryLower.includes('mechanical') ||
        categoryLower.includes('engineering')) {
      return mechanicalImg;
    }
    
    // AutoCAD related
    if (titleLower.includes('autocad') ||
        titleLower.includes('auto cad') ||
        titleLower.includes('cad') ||
        categoryLower.includes('autocad') ||
        categoryLower.includes('cad')) {
      return autocadImg;
    }
    
    // 3D Design related
    if (titleLower.includes('3d') ||
        titleLower.includes('modeling') ||
        titleLower.includes('blender') ||
        titleLower.includes('fusion') ||
        categoryLower.includes('3d')) {
      return threeDesignImg;
    }
    
    // AI/ML related
    if (titleLower.includes('ai') ||
        titleLower.includes('artificial intelligence') ||
        titleLower.includes('machine learning') ||
        titleLower.includes('data science') ||
        categoryLower.includes('ai') ||
        categoryLower.includes('ml') ||
        categoryLower.includes('data science')) {
      return aimlImg;
    }
    
    // IoT/Electronics related
    if (titleLower.includes('iot') ||
        titleLower.includes('internet of things') ||
        titleLower.includes('electronics') ||
        titleLower.includes('arduino') ||
        titleLower.includes('raspberry') ||
        categoryLower.includes('iot') ||
        categoryLower.includes('electronics')) {
      return iotImg;
    }
    
    // DevOps/Cloud related
    if (titleLower.includes('devops') ||
        titleLower.includes('cloud') ||
        titleLower.includes('aws') ||
        titleLower.includes('azure') ||
        categoryLower.includes('devops') ||
        categoryLower.includes('cloud')) {
      return devopsImg;
    }
    
    // For regular courses, use category-based images
    if (course.category && course.category.toLowerCase() in categoryImages) {
      return categoryImages[course.category.toLowerCase() as keyof typeof categoryImages];
    }
    
    // Default fallback
    return categoryImages.default;
  };

  // Create star rating display for books and courses
  const renderRating = () => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            size={isBookOrPDF ? 12 : 14}
            className={`${i < Math.floor(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className={`text-gray-500 ml-1 ${isBookOrPDF ? 'text-xs' : 'text-sm'}`}>({course.rating.toFixed(1)})</span>
      </div>
    );
  };

  // Apply different styling for books vs courses
  const cardStyle = isBookOrPDF
    ? "bg-white rounded-xl flex flex-col shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer w-full max-w-[280px] h-[420px] border border-gray-100"
    : "bg-white rounded-xl flex flex-col shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer w-full sm:w-[180px] md:w-[200px] lg:w-[220px] xl:w-[240px] 2xl:w-[280px] h-full border border-gray-100";

  // Only show badges that are NOT "AI Generated"
  const displayBadge = course.badge && course.badge !== "AI Generated";

  return (
    <div className={cardStyle}>
      <div className="relative">
        <img
          src={getImage()}
          alt={course.title}
          className={isBookOrPDF 
            ? "w-full h-[180px] object-cover rounded-t-xl" 
            : "w-full h-40 sm:h-44 object-cover rounded-t-xl"
          }
          loading="lazy"
        />
        {displayBadge && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white py-0.5 px-2 rounded-full text-xs font-medium">
            {course.badge}
          </div>
        )}
        {isBookOrPDF && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 text-white mr-1 shrink-0" />
              <span className="text-sm font-medium text-white truncate">
                {course.topic || course.category || "STARC Resource"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-500 text-sm mb-2">By {"STARC team"}</p>

        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              size={16}
              className={`${i < Math.floor(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-gray-500 ml-1 text-sm">({course.rating.toFixed(1)})</span>
        </div>

        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
          {isBookOrPDF ? (
            <>
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                <span>{course.students.toLocaleString()}</span>
              </div>
              {course.pages && (
                <div className="flex items-center">
                  <BookOpen size={16} className="mr-1" />
                  <span>{course.pages} pages</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                <span>{course.students.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <span>{course.duration}</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
          {course.price === 0 ? (
            <span className="text-green-600 font-bold text-lg">Free</span>
          ) : (
            <div className="flex flex-col">
              <span className="text-[#8A63FF] font-bold text-lg">${course.price.toFixed(2)}</span>
              {course.originalPrice > course.price && (
                <span className="text-gray-400 line-through text-sm">
                  ${course.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recard;

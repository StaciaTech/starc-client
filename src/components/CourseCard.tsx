import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Clock, Star } from "lucide-react";
import defaultImage from "../Assets/icons/course1.svg";
import softwareImage from "../Assets/icons/course1.svg";
import designImg from "../Assets/icons/course2.svg";
import mechanicalImage from "../Assets/icons/course4.svg";

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructor: any;
  price: number;
  discount?: boolean;
  duration: number;
  lessons: any[];
  level: string;
  category: string;
  enrolledUsers?: string[];
  rating?: number;
  thumbnail?: string;
  badge?: string; // Added for badges like 'Sale'
}

export interface CourseCardProps {
  title: string;
  instructor: string;
  rating: number;
  students: number;
  price: number;
  originalPrice?: number;
  duration: string;
  lessons: number;
  level: string;
  category: string;
  image?: string;
  badge?: string;
  _id?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  instructor,
  rating,
  students,
  price,
  originalPrice,
  duration,
  lessons,
  level,
  category,
  image,
  badge,
  _id,
}) => {
  // Determine the appropriate image based on course title or category keywords
  const getAppropriateImage = () => {
    const titleLower = title.toLowerCase();
    const categoryLower = category ? category.toLowerCase() : '';
    
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
      return softwareImage;
    }
    
    // Check for design-related keywords
    if (
      titleLower.includes('design') ||
      titleLower.includes('ui') ||
      titleLower.includes('ux') ||
      titleLower.includes('user interface') ||
      titleLower.includes('user experience') ||
      categoryLower.includes('design') ||
      categoryLower.includes('ui') ||
      categoryLower.includes('ux')
    ) {
      return designImg;
    }
    
    // Check for mechanical-related keywords
    if (
      titleLower.includes('mechanical') ||
      titleLower.includes('engineering') ||
      titleLower.includes('machine') ||
      categoryLower.includes('mechanical') ||
      categoryLower.includes('engineering')
    ) {
      return mechanicalImage;
    }
    
    // Check for AutoCAD-related keywords
    if (
      titleLower.includes('autocad') ||
      titleLower.includes('auto cad') ||
      titleLower.includes('cad') ||
      categoryLower.includes('autocad') ||
      categoryLower.includes('cad')
    ) {
      return mechanicalImage; // Using mechanical image for AutoCAD
    }
    
    // Check for 3D design keywords
    if (
      titleLower.includes('3d') ||
      titleLower.includes('modeling') ||
      titleLower.includes('blender') ||
      titleLower.includes('fusion') ||
      categoryLower.includes('3d')
    ) {
      return mechanicalImage; // Using mechanical image for 3D design
    }
    
    // Use provided image or default if no keywords match
    return image || defaultImage;
  };
  
  const courseImage = getAppropriateImage();

  // Only display badge if it's not "AI Generated"
  const displayBadge = badge && badge !== "AI Generated";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden max-w-md mx-auto w-full"
    >
      <Link to={`/courses/${_id}`} className="block">
        <div className="relative">
          <img
            src={courseImage}
            alt={title}
            className="w-full h-48 object-cover"
          />
          {displayBadge && (
            <div className="absolute top-3 right-3 bg-[#8A63FF] text-white text-xs font-bold py-1 px-2 rounded">
              {badge}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center">
              <Users size={14} className="mr-1" />
              <span>{students} students</span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
          
          <div className="flex items-center mb-2">
            <div className="flex mr-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{rating.toFixed(1)}</span>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <div className="text-sm font-medium text-gray-500">
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </div>
            <div>
              {originalPrice && originalPrice > price ? (
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm line-through mr-2">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="text-[#8A63FF] font-bold">
                    ${price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-[#8A63FF] font-bold">
                  {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
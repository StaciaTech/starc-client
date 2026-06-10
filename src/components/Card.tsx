import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, BookOpen, Star, Users } from "lucide-react";

// Import course images with better naming
import webDevImg from "../Assets/icons/course1.svg";
import designImg from "../Assets/icons/course2.svg";
import iotImg from "../Assets/icons/course3.svg";
import mechanicalImg from "../Assets/icons/course4.svg";
import aimlImg from "../Assets/icons/course5.svg";
import devopsImg from "../Assets/icons/course6.svg";
import threeDesignImg from "../Assets/icons/course4.svg";
import autocadImg from "../Assets/icons/course4.svg";

// Category to image mapping
const categoryImages = {
  development: webDevImg,
  "web development": webDevImg,
  "software development": webDevImg,
  design: designImg,
  "ui/ux": designImg,
  mechanical: mechanicalImg,
  engineering: mechanicalImg,
  autocad: mechanicalImg,
  iot: iotImg,
  electronics: iotImg,
  ai: aimlImg,
  ml: aimlImg,
  "data science": aimlImg,
  devops: devopsImg,
  "cloud computing": devopsImg,
  default: webDevImg,
};

export interface Course {
  image: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  lessons: number;
  price: number;
  originalPrice?: number; // ✅ Make optional since backend sends "discount" instead
  discount?: number; // ✅ Add discount percentage from backend
  badge?: string;
  category?: string;
  _id?: string;
  driveUrl?: string;
  type?: string;
  topic?: string;
  pages?: number;
}

interface CardProps {
  course: Course;
}

const Recard: React.FC<CardProps> = ({ course }) => {
  console.log("recard", course);

  const navigate = useNavigate();
  const titleLower = course.title ? course.title.toLowerCase() : "";
  const categoryLower = course.category ? course.category.toLowerCase() : "";
  const isBookOrPDF = course.type === "book" || course.driveUrl || course.pages;

  // ✅ Animation states
  const [showStrike, setShowStrike] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

  // ✅ Calculate discounted price from backend discount percentage
  const hasDiscount = course.discount && course.discount > 0;
  const originalPrice = course.originalPrice;
  const discountedPrice = course.price;

  // ✅ Trigger animation on mount
  useEffect(() => {
    if (hasDiscount) {
      // Show strikethrough animation after 300ms
      const strikeTimer = setTimeout(() => setShowStrike(true), 300);
      // Show discount price after 600ms
      const discountTimer = setTimeout(() => setShowDiscount(true), 600);

      return () => {
        clearTimeout(strikeTimer);
        clearTimeout(discountTimer);
      };
    }
  }, [hasDiscount]);

  // Determine the appropriate image based on course content
  const getImage = () => {
    // ✅ If a real S3/HTTP thumbnail URL or local image path is provided, always use it
    if (course.image && (
      course.image.startsWith("http") ||
      course.image.startsWith("/") ||
      /\.(jpeg|jpg|gif|png|svg|webp)/i.test(course.image)
    )) {
      return course.image;
    }

    if (
      titleLower.includes("software") ||
      titleLower.includes("programming") ||
      titleLower.includes("coding") ||
      titleLower.includes("development") ||
      titleLower.includes("web") ||
      titleLower.includes("python") ||
      titleLower.includes("java") ||
      titleLower.includes("javascript") ||
      categoryLower.includes("development") ||
      categoryLower.includes("programming")
    ) {
      return webDevImg;
    }

    if (
      titleLower.includes("ui") ||
      titleLower.includes("ux") ||
      titleLower.includes("user interface") ||
      titleLower.includes("user experience") ||
      titleLower.includes("design") ||
      categoryLower.includes("design") ||
      categoryLower.includes("ui/ux")
    ) {
      return designImg;
    }

    if (
      titleLower.includes("mechanical") ||
      titleLower.includes("engineering") ||
      titleLower.includes("machine") ||
      titleLower.includes("physics") ||
      categoryLower.includes("mechanical") ||
      categoryLower.includes("engineering")
    ) {
      return mechanicalImg;
    }

    if (
      titleLower.includes("autocad") ||
      titleLower.includes("auto cad") ||
      titleLower.includes("cad") ||
      categoryLower.includes("autocad") ||
      categoryLower.includes("cad")
    ) {
      return autocadImg;
    }

    if (
      titleLower.includes("3d") ||
      titleLower.includes("modeling") ||
      titleLower.includes("blender") ||
      titleLower.includes("fusion") ||
      categoryLower.includes("3d")
    ) {
      return threeDesignImg;
    }

    if (
      titleLower.includes("ai") ||
      titleLower.includes("artificial intelligence") ||
      titleLower.includes("machine learning") ||
      titleLower.includes("data science") ||
      categoryLower.includes("ai") ||
      categoryLower.includes("ml") ||
      categoryLower.includes("data science")
    ) {
      return aimlImg;
    }

    if (
      titleLower.includes("iot") ||
      titleLower.includes("internet of things") ||
      titleLower.includes("electronics") ||
      titleLower.includes("arduino") ||
      titleLower.includes("raspberry") ||
      categoryLower.includes("iot") ||
      categoryLower.includes("electronics")
    ) {
      return iotImg;
    }

    if (
      titleLower.includes("devops") ||
      titleLower.includes("cloud") ||
      titleLower.includes("aws") ||
      titleLower.includes("azure") ||
      categoryLower.includes("devops") ||
      categoryLower.includes("cloud")
    ) {
      return devopsImg;
    }

    if (course.category && course.category.toLowerCase() in categoryImages) {
      return categoryImages[
        course.category.toLowerCase() as keyof typeof categoryImages
      ];
    }

    return course.image || categoryImages.default;
  };

  // Only show badges that are NOT "AI Generated"
  const displayBadge = course.badge && course.badge !== "AI Generated";

  return (
    <div className="bg-white rounded-xl flex flex-col shadow-md hover:shadow-xl transition-all duration-300 w-full h-full border border-gray-100 overflow-hidden">
      {/* Image Section */}
      <div className="relative w-full aspect-[16/10]">
        <img
          src={getImage()}
          alt={course.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback to default SVG if S3 image fails to load
            (e.target as HTMLImageElement).src = webDevImg;
          }}
        />

        {/* ✅ Top Badges Container */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {/* Course Badge */}
          {displayBadge && (
            <div className="bg-purple-600 text-white py-0.5 px-2 rounded-full text-xs font-medium">
              {course.badge}
            </div>
          )}

          {/* ✅ Discount Badge with Animation */}
          {hasDiscount && (
            <div
              className={`bg-gradient-to-r from-red-500 to-pink-500 text-white py-1 px-2.5 rounded-full text-xs font-bold shadow-lg transform transition-all duration-500 ${showDiscount ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
            >
              {course.discount}% OFF
            </div>
          )}
        </div>

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

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-gray-500 text-xs sm:text-sm mb-2">By STARC team</p>

        {/* Rating */}
        <div className="flex items-center mb-2 sm:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={`${i < Math.floor(course.rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
                }`}
            />
          ))}
          <span className="text-gray-500 ml-1 text-xs sm:text-sm">
            ({course.rating.toFixed(1)})
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center text-xs sm:text-sm text-gray-500 space-x-3 sm:space-x-4 mb-3">
          {isBookOrPDF ? (
            <>
              <div className="flex items-center">
                <Users size={14} className="mr-1 shrink-0" />
                <span>{course.students.toLocaleString()}</span>
              </div>
              {course.pages && (
                <div className="flex items-center">
                  <BookOpen size={14} className="mr-1 shrink-0" />
                  <span>{course.pages} pages</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center">
                <Users size={14} className="mr-1 shrink-0" />
                <span>{course.students.toLocaleString()}</span>
              </div>
              {/* <div className="flex items-center">
                <Clock size={14} className="mr-1 shrink-0" />
                <span>{course.duration}</span>
              </div> */}
            </>
          )}
        </div>

        {/* Spacer to push price to bottom */}
        <div className="flex-1"></div>

        {/* ✅ Price Section with Animation */}
        <div className="pt-2 sm:pt-3 border-t border-gray-100">
          {course.price === 0 ? (
            <span className="text-green-600 font-bold text-base sm:text-lg">
              Free
            </span>
          ) : (
            <div className="flex items-center justify-between">
              {/* Price Container */}
              <div className="flex items-center gap-2">
                {/* ✅ Discounted Price (Animated) */}
                {hasDiscount ? (
                  <>
                    <span
                      className={`text-[#8A63FF] font-bold text-lg sm:text-xl transition-all duration-500 ${showDiscount
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                        }`}
                    >
                      ${discountedPrice.toFixed(2)}
                    </span>

                    {/* ✅ Original Price with Strikethrough Animation */}
                    <div className="relative">
                      <span className="text-gray-400 text-sm sm:text-base">
                        ${originalPrice.toFixed(2)}
                      </span>
                      {/* Animated strikethrough line */}
                      <div
                        className={`absolute top-1/2 left-0 h-[2px] bg-red-500 transition-all duration-700 ease-out ${showStrike ? "w-full" : "w-0"
                          }`}
                        style={{ transform: "translateY(-50%)" }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <span className="text-[#8A63FF] font-bold text-lg sm:text-xl">
                    ${course.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* ✅ Discount Percentage Badge (Right side) */}
              {hasDiscount && (
                <div
                  className={`flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md transition-all duration-500 ${showDiscount
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-50"
                    }`}
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>SAVE {course.discount}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recard;

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PurpleBox from "@/components/PurpleBox";
import Footer from "@/components/Footer";
import WallOfLove from "../components/WallOfLove";
import { useNavigate } from "react-router-dom";
import heroimage from "../Assets/Vector.png";
import Recard from "@/components/Card";
import courseService, { ICourse } from "@/services/courseService";
import { Scale } from "lucide-react";

// Define TypeScript interface for a Course
interface Course {
  title: string;
  instructor: string;
  // description: string;
  rating: number;
  students: number;
  price: number;
  originalPrice: number;
  duration: string;
  lessons: number;
  level: string;
  category: string;
  image: string;
  badge?: string;
  _id?: string; // Add _id field for course ID
  driveUrl?: string; // Added for book links
  type?: string; // Added to distinguish between 'course' and 'book' types
  id?: string; // Some courses might use id instead of _id
}

// Define interface for UserCourse
interface UserCourse {
  courseId: string;
  userId: string;
  progress?: number;
  completed?: boolean;
}

// Define TypeScript interface for FilterSection props
interface FilterSectionProps {
  initialActiveButton?: "supervised" | "unsupervised";
  description?: string;
  onToggle?: (activeButton: "supervised" | "unsupervised") => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  initialActiveButton = "supervised",
  description = "Scheduled live Google Meet classes with calendar/email alerts, seasonal batches, and fixed enrollment deadlines.",
  onToggle,
}) => {
  const [activeButton, setActiveButton] = useState<
    "supervised" | "unsupervised"
  >(initialActiveButton);

  const handleToggle = (button: "supervised" | "unsupervised") => {
    setActiveButton(button);
    if (onToggle) {
      onToggle(button);
    }
  };

  const SortDropdown: React.FC = () => {
    const [sortOption, setSortOption] = useState("Latest");

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortOption(e.target.value);
    };
    return (
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-1">
          Sort by:
        </label>
        <div className="relative">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="w-48 p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-gray-700"
          >
            <option value="Latest">Latest</option>
            <option value="Most Popular">Most Popular</option>
            <option value="Highest Rated">Highest Rated</option>
            <option value="Newest">Newest</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {/* Custom dropdown styling for options */}
        <style>{`
        select option:checked {
          background-color: #8A63FF;
          color: white;
        }
        select option {
          padding: 8px;
        }
      `}</style>
      </div>
    );
  };

  return (
    <section className="bg-white  ">
      <div className="max-w-7xl mx-auto px-4  sm:px-6 lg:px-8">
        <div className=" flex flex-col  ">
          <div className="flex items-center gap-4 flex-col  ">
            <div className="flex items-center  bg-white-500 p-1   rounded-full  " style={{
              boxShadow: "0px 0px 22.4px 0px #00000040"
            }}>
              <button
                onClick={() => handleToggle("supervised")}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${activeButton === "supervised"
                    ? "bg-[#8A63FF] text-white"
                    : "bg-white text-gray-600"
                  }`}
              >
                Supervised
              </button>
              <button
                onClick={() => handleToggle("unsupervised")}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${activeButton === "unsupervised"
                    ? "bg-[#8A63FF] text-white"
                    : "bg-white text-[#8A63FF]"
                  }`}
              >
                Unsupervised
              </button>
            </div>
            <span className="text-sm text-[#8A63FF] lg:w-[50%] xl:w-[40%] flex text-center">
              {description}
            </span>
          </div>
        </div>

        <div className="p-10 w-[100%] h-auto ">
          <h2 className="text-2xl font-semibold mb-6">Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Search:
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search in your courses..."
                  className="w-full rounded-full border: 20px solid border border-[#00000040] px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Sort by:
              </label>
              <select
                id="sort"
                className="w-full rounded-full border: 20px solid border border-[#00000040] px-4 py-2  focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              >
                <option>Latest</option>
                <option>Most Popular</option>
                <option>Highest Rated</option>
                <option>Newest</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Status:
              </label>
              <select
                id="status"
                className="w-full rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              >
                <option>All Courses</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Not Started</option>
              </select>
            </div>

            
          </div>
        </div>
      </div>
    </section>
  );
};

const Course: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"supervised" | "unsupervised">("supervised");
  // Add userCourses state with mock data for supervised mode
  const [userCourses, setUserCourses] = useState<UserCourse[]>([
    { courseId: "1", userId: "user1" },
    { courseId: "2", userId: "user1" },
    { courseId: "3", userId: "user1" }
  ]);

  // Sample data for books in unsupervised mode - updated with all books from Book page
  const starcBooks = [
    {
      id: "1",
      title: "STARC Full Stack Development Book",
      author: "STARC Learning Team",
      topic: "Full Stack",
      coverImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=400&fit=crop",
      driveUrl: "https://drive.google.com/file/d/1qKlORe2GuOlmxVuTGF1Ac1qQrzbbHQhf/view?usp=sharing",
      rating: 4.9,
      pages: 412,
      description: "Comprehensive guide to full stack web development covering frontend and backend technologies.",
      category: "development",
      instructor: "STARC Learning Team",
      students: 1200,
      price: 0,
      originalPrice: 49.99,
      duration: "Self-paced",
      lessons: 18,
      level: "intermediate",
      badge: "STARC",
      type: "book"
    },
    {
      id: "2",
      title: "The Ultimate Self-Learning Guide to Autodesk Fusion 360",
      author: "Design Engineering Team",
      topic: "3D Design",
      coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=400&fit=crop",
      driveUrl: "https://docs.google.com/document/d/16cO2mnQiksjODlgMq5GCXjNsK3wSpxmWhN9OJ9SgbRE/edit?usp=sharing",
      rating: 4.8,
      pages: 325,
      description: "Learn Autodesk Fusion 360 from scratch with this comprehensive self-learning guide.",
      category: "design",
      instructor: "Design Engineering Team",
      students: 950,
      price: 0,
      originalPrice: 39.99,
      duration: "Self-paced",
      lessons: 15,
      level: "beginner",
      badge: "STARC",
      type: "book"
    },
    {
      id: "3",
      title: "Machine Learning Fundamentals",
      author: "AI Research Group",
      topic: "AI/ML",
      coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=400&fit=crop",
      driveUrl: "https://drive.google.com/file/d/1SH1l3XIK3v9mmvGiO-RbMll9Ho9e25qx/preview",
      rating: 4.7,
      pages: 280,
      description: "Comprehensive introduction to machine learning concepts and algorithms.",
      category: "ai/ml",
      instructor: "AI Research Group",
      students: 1500,
      price: 0,
      originalPrice: 59.99,
      duration: "Self-paced",
      lessons: 22,
      level: "intermediate",
      badge: "STARC",
      type: "book"
    },
    
  ];

  useEffect(() => {
    // Fetch courses from the API
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const courses = await courseService.getCourses();
        
        // Format the course data
        const formattedCourses: Course[] = courses.map((course: ICourse) => {
          // Determine badge value, removing AI Generated badges completely
          let badgeValue;
          if (course.discount) {
            badgeValue = "Sale";
          } else {
            // Don't set a badge for AI Generated courses or if no badge exists
            badgeValue = undefined;
          }
          
          return {
            title: course.title,
            instructor: course.instructor?.name || "Unknown Instructor",
            rating: course.rating || 0,
            students: course.enrolledUsers?.length || 0,
            price: course.price,
            originalPrice: course.price,
            duration: `${course.duration} hours`,
            lessons: course.lessons?.length || 0,
            level: course.level,
            category: course.category === "AI Generated" ? "Development" : course.category, // Replace "AI Generated" category
            image: course.thumbnail || "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=300&h=200&fit=crop",
            badge: badgeValue,
            _id: course._id,
            // Add safe type property with default 'course'
            type: 'course'
          };
        });
        
        setCoursesData(formattedCourses);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleModeToggle = (activeMode: "supervised" | "unsupervised") => {
    setMode(activeMode);
  };

  // Filter courses based on category
  const filterCards = (category: string) => {
    setSelectedCategory(category);
  };

  // Get the courses to display based on mode and filters
  const getDisplayCourses = (mode: string, courses: Course[] | undefined, userCourses: UserCourse[] | undefined) => {
    // In supervised mode, show regular courses
    if (mode === 'supervised') {
      if (!courses) return [];
      
      // Filter to show only regular courses (excluding books)
      return courses.filter(course => 
        // Only include items with type 'course' or without driveUrl (meaning they're not books)
        (course.type === 'course' || !course.driveUrl)
      );
    } 
    // In unsupervised mode, show only books (STARC materials)
    else {
      // Return the starcBooks array for unsupervised mode
      return starcBooks as unknown as Course[];
    }
  };

  // Apply category filtering if needed
  const applyFilters = (courses: Course[]) => {
    if (!courses) return [];
    if (selectedCategory === "all") return courses;
    
    return courses.filter(course => {
      const courseCategory = (course.category || "").toLowerCase();
      return courseCategory.includes(selectedCategory.toLowerCase());
    });
  };

  // Get courses based on mode, then apply filters
  const displayCourses = getDisplayCourses(mode, coursesData, userCourses);
  const filteredCourses = applyFilters(displayCourses);

  const [activeIndex, setActiveIndex] = useState(0);

  const categories = [
    "All Categories",
    "Development",
    "Design",
    "Marketing",
    "Business",
    "Photography",
    "Data Science",
    "AI/ML",
    "Mobile Development",
    "Cloud Computing",
    "DevOps",
    "Cybersecurity",
    "Blockchain",
    "IoT",
    "Game Development",
  ];

  return (
    <div className="min-h-screen bg-white font-mont">
      <Navbar />

      {/* Hero Section */}
      <section className=" relative bottom-20 ">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className=" flex flex-col justify-center items-center">
            <img
              src={heroimage}
              alt="Hero Image"
              className="mx-auto"
              style={{
                width: "500px",
                height: "auto",
                position: "relative",
                left: "0",
                top: "90px",
                transform:"ScaleX(-1)"
              }}
            />
            <div className="">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
                Discover Our Edifai Courses
              </h1>
              <p className="text-[14px] text-gray-600 max-w-3xl mx-auto mb-8">
                Discover selected courses taught by expert instructors.
                Start learning today and advance your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <FilterSection
        initialActiveButton="supervised"
        description={
          mode === "supervised" 
            ? "Scheduled live Google Meet classes with calendar/email alerts, seasonal batches, and fixed enrollment deadlines." 
            : "Self-paced learning materials and PDF books you can download and study at your own pace."
        }
        onToggle={handleModeToggle}
      />

      {/* Category and Course Cards Section */}
      <div className="flex justify-center mb-20">
        {loading ? (
          <div className="flex relative justify-center py-8 mb-16  xl:w-[90%]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A63FF]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
       <section className="flex relative justify-center py-8 mb-16 xl:w-[90%] flex-col md:flex-row">
            {/* Sidebar - hide on mobile, show on md and up */}
            <section className="hidden md:block sticky h-[80vh] top-[90px] lg:w-[25%] xl:w-[25%] 2xl:w-[25%] 3xl:w-[25%] overflow-y-auto px-2" style={{scrollbarWidth:"thin"}}>
              <div className="w-full">
                <div className="max-w-c mx-auto px-4 sm:px-6 lg:px-10">
                  <h2 className="text-2xl font-mont font-bold mb-4 py-2 text-gray-800 text-center">
                    Categories
                  </h2>
                  <ul className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((category, index) => (
                      <li
                        key={index}
                        onClick={() =>{ 
                          setActiveIndex(index);
                          filterCards(index === 0 ? "all" : category.toLowerCase());
                        }}
                        className={`py-4 px-4 lg:text-[10px] xl:text-sm 2xl:text-base 3xl:text-lg cursor-pointer items-start w-[95%] border-gray-200 border-b-[0.1px] transition-all duration-200 ${index === activeIndex
                            ? "text-[#8A63FF] font-semibold"
                            : "text-gray-800"
                          }`}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Mobile Categories Dropdown */}
            <div className="md:hidden w-full px-4 mb-4">
              <select 
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  setActiveIndex(index);
                  filterCards(index === 0 ? "all" : categories[index].toLowerCase());
                }}
                value={activeIndex}
              >
                {categories.map((category, index) => (
                  <option key={index} value={index}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Course Cards Grid - full width on mobile, adjusted for larger screens */}
            <div className="flex flex-wrap justify-center md:justify-start w-full md:w-[80%] md:pl-4 lg:pl-10 px-2 md:px-4 overflow-auto gap-5 md:gap-6" style={{scrollbarWidth:'none'}}>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <div  
                    key={index}
                    onClick={() => {
                      // Navigate differently based on the content type
                      if (mode === "unsupervised" && course.driveUrl) {
                        // For books, go directly to the book page
                        navigate("/book");
                      } else if (course._id) {
                        // For regular courses with ID, go to the course detail page
                        navigate(`/course/${course._id}`);
                      } else {
                        // Fallback for other types of content
                        navigate('/carddetail', { state: { course } });
                      }
                    }}
                    className={`flex justify-center ${
                      mode === "unsupervised" 
                        ? "w-full sm:w-[45%] md:w-[30%] lg:w-[30%] xl:w-[30%] 2xl:w-[30%]" 
                        : "w-full xs:w-[45%] sm:w-[45%] md:w-[30%] lg:w-[30%] xl:w-[30%] 2xl:w-[30%]"
                    }`}
                  >
                    <Recard course={course} key={index} />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-500">
                  No courses found in this category.
                </div>
              )}
            </div>
          </section>
        )}
            </div>

      <div className="flex justify-center">
        <PurpleBox />
      </div>
      <WallOfLove />
      <Footer />
    </div>
  );
};

export default Course;

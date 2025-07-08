// KEEP all imports
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PurpleBox from "@/components/PurpleBox";
import Footer from "@/components/Footer";
import WallOfLove from "../components/WallOfLove";
import { useNavigate } from "react-router-dom";
import heroimage from "../Assets/Vector.png";
import Recard from "@/components/Card";
import courseService, { ICourse } from "@/services/courseService";
import { Button } from "@/components/ui/button";

// Course interfaces stay as you wrote
interface Course {
  title: string;
  instructor: string;
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
  _id?: string;
  driveUrl?: string;
  type?: string;
  id?: string;
  createdAt?: string; // ✅ Added for sorting "Latest"
}

interface UserCourse {
  courseId: string;
  userId: string;
  progress?: number;
  completed?: boolean;
}

const Course: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"supervised" | "unsupervised">("supervised");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("Latest");
  const [statusFilter, setStatusFilter] = useState<string>("All Courses");

  const [userCourses] = useState<UserCourse[]>([
    { courseId: "1", userId: "user1" },
    { courseId: "2", userId: "user1" },
    { courseId: "3", userId: "user1", completed: true },
  ]);

  const starcBooks = [
    // keep your books exactly as you wrote them
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const courses = await courseService.getCourses();
        const formattedCourses: Course[] = courses.map((course: ICourse) => ({
          title: course.title,
          instructor: course.instructor?.name || "Unknown Instructor",
          rating: course.rating || 0,
          students: course.enrolledUsers?.length || 0,
          price: course.price,
          originalPrice: course.price,
          duration: `${course.duration} hours`,
          lessons: course.lessons?.length || 0,
          level: course.level,
          category:
            course.category === "AI Generated"
              ? "Development"
              : course.category,
          image:
            course.thumbnail ||
            "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=300&h=200&fit=crop",
          badge: course.discount ? "Sale" : undefined,
          _id: course._id,
          type: "course",
          // createdAt: course.createdAt, // ✅ used for sorting "Latest"
        }));
        setCoursesData(formattedCourses);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses");
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleModeToggle = (activeMode: "supervised" | "unsupervised") => {
    setMode(activeMode);
  };

  const applyFilters = (courses: Course[]) => {
    let filtered = courses;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) =>
        (c.category || "")
          .toLowerCase()
          .includes(selectedCategory.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "All Courses") {
      if (statusFilter === "In Progress") {
        filtered = filtered.filter((c) =>
          userCourses.find((uc) => uc.courseId === c._id && !uc.completed)
        );
      } else if (statusFilter === "Completed") {
        filtered = filtered.filter((c) =>
          userCourses.find((uc) => uc.courseId === c._id && uc.completed)
        );
      } else if (statusFilter === "Not Started") {
        filtered = filtered.filter(
          (c) => !userCourses.find((uc) => uc.courseId === c._id)
        );
      }
    }

    // ✅ Sort logic
    switch (sortOption) {
      case "Most Popular":
        filtered = filtered.slice().sort((a, b) => b.students - a.students);
        break;
      case "Highest Rated":
        filtered = filtered.slice().sort((a, b) => b.rating - a.rating);
        break;
      case "Newest":
        filtered = filtered
          .slice()
          .sort((a, b) => (b._id || "").localeCompare(a._id || ""));
        break;
      default:
        break;
    }

    return filtered;
  };

  const displayCourses =
    mode === "supervised" ? coursesData : (starcBooks as unknown as Course[]);
  const filteredCourses = applyFilters(displayCourses);

  const categories = [
    "All Categories",
    "Design",
    "Development",
    "Mechanical",
    "IOT",
    "AI/ML",
    "Cloud",
    "Cybersecurity",
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const filterCards = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-white font-mont">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bottom-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col justify-center items-center">
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
                transform: "ScaleX(-1)",
              }}
            />
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
                Discover Our Edifai Courses
              </h1>
              <p className="text-[14px] text-gray-600 max-w-3xl mx-auto mb-8">
                Discover selected courses taught by expert instructors. Start
                learning today and advance your career.
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
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Cards Section */}
      <div className="flex justify-center mb-20">
        {loading ? (
          <div className="flex relative justify-center py-8 mb-16 xl:w-[90%]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A63FF]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <section className="flex relative justify-center py-8 mb-16 xl:w-[90%] flex-col md:flex-row">
            <section
              className="hidden md:block sticky h-[80vh] top-[90px] lg:w-[25%] overflow-y-auto px-2"
              style={{ scrollbarWidth: "thin" }}
            >
              <div className="w-full">
                <div className="max-w-c mx-auto px-4 sm:px-6 lg:px-10">
                  <h2 className="text-2xl font-mont font-bold mb-4 py-2 text-gray-800 text-center">
                    Categories
                  </h2>
                  <ul className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((category, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          setActiveIndex(index);
                          filterCards(
                            index === 0 ? "all" : category.toLowerCase()
                          );
                        }}
                        className={`py-4 px-4 lg:text-[10px] xl:text-sm cursor-pointer w-[95%] border-b-[0.1px] ${
                          index === activeIndex
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

            <div className="flex flex-wrap justify-center md:justify-start w-full md:w-[80%] gap-5 md:gap-6">
              {mode === "unsupervised" ? (
                <div className="w-full flex flex-col items-center justify-center py-12">
                  <h2 className="text-2xl font-bold mb-4">
                    Unlock Self-Paced Materials
                  </h2>
                  <Button className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white px-6 py-3 rounded-full">
                    Enroll Now
                  </Button>
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (mode === "unsupervised" && course.driveUrl) {
                        navigate("/book");
                      } else if (course._id) {
                        navigate(`/course/${course._id}`);
                      } else {
                        navigate("/carddetail", { state: { course } });
                      }
                    }}
                    className="flex justify-center w-full xs:w-[45%] sm:w-[45%] md:w-[30%]"
                  >
                    <Recard course={course} />
                  </div>
                ))
              ) : (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-3 shadow-lg z-50 border-t border-gray-200">
                  <Button className="w-full bg-[#8A63FF] text-white py-3 rounded-lg font-semibold hover:bg-[#7A53EF] transition">
                    Enroll Now
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <PurpleBox />
      <WallOfLove />
      <Footer />
    </div>
  );
};

interface FilterSectionProps {
  initialActiveButton?: "supervised" | "unsupervised";
  description?: string;
  onToggle?: (activeButton: "supervised" | "unsupervised") => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortOption: string;
  onSortOptionChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  initialActiveButton,
  description,
  onToggle,
  searchQuery,
  onSearchQueryChange,
  sortOption,
  onSortOptionChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [activeButton, setActiveButton] = useState(
    initialActiveButton || "supervised"
  );

  const handleToggle = (button: "supervised" | "unsupervised") => {
    setActiveButton(button);
    onToggle?.(button);
  };

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-4 flex-col">
            <div
              className="flex items-center bg-white-500 p-1 rounded-full"
              style={{ boxShadow: "0px 0px 22.4px 0px #00000040" }}
            >
              <button
                onClick={() => handleToggle("supervised")}
                className={`px-4 py-2 rounded-full font-semibold ${
                  activeButton === "supervised"
                    ? "bg-[#8A63FF] text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                Supervised
              </button>
              <button
                onClick={() => handleToggle("unsupervised")}
                className={`px-4 py-2 rounded-full font-semibold ${
                  activeButton === "unsupervised"
                    ? "bg-[#8A63FF] text-white"
                    : "bg-white text-[#8A63FF]"
                }`}
              >
                Unsupervised
              </button>
            </div>
            <span className="text-sm text-[#8A63FF] text-center">
              {description}
            </span>
          </div>
        </div>
        <div className="p-10 w-full h-auto">
          <h2 className="text-2xl font-semibold mb-6">Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search in your courses..."
                className="w-full rounded-full border px-4 py-2 pl-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => onSortOptionChange(e.target.value)}
                className="w-full rounded-full border px-4 py-2"
              >
                <option>Most Popular</option>
                <option>Highest Rated</option>
                <option>Newest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full rounded-full border px-4 py-2"
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

export default Course;

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PurpleBox from "@/components/PurpleBox";
import Footer from "@/components/Footer";
import WallOfLove from "../components/WallOfLove";
import { useNavigate, useLocation } from "react-router-dom";
import heroimage from "../Assets/Vector.png";
import Recard from "@/components/Card";
import courseService, { ICourse } from "@/services/courseService";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Lock } from "lucide-react";
import { useAddToCart, useCart, useRemoveFromCart } from "../hooks/useCart";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "../hooks/useWishlist";
import { useEnrollments } from "@/hooks/useEnrollments"; // ✅ Import enrollments hook
import { toast } from "sonner";
import { useAuth } from "@/App";
import EntranceTestModal from "@/components/EntranceTestModal";
import { assessmentService } from "@/services/assessmentService";

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
  createdAt?: string;
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

  const starcBooks: any[] = [];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const courses = await courseService.getCourses();
        const formattedCourses: Course[] = courses.map((course: ICourse) => {
          // ✅ Original price is the base price
          console.log(course);

          const originalPrice = course.price;

          // ✅ Calculate discounted price if discount exists
          const discountedPrice =
            course.discount && course.discount > 0
              ? course.price - course.price * (course.discount / 100)
              : course.price;

          return {
            title: course.title,
            instructor: course.instructor?.name || "Unknown Instructor",
            rating: course.rating || 0,
            students: course.enrolledUsers?.length || 0,
            price: 299.99, // ✅ Discounted price
            originalPrice: 299.99, // ✅ Original price (before discount)
            discount: course.discount || 0, // ✅ Add discount percentage
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
            badge: course.discount && course.discount > 0 ? "Sale" : undefined, // ✅ Only show Sale badge if discount exists
            _id: course._id,
            type: "course",
          };
        });
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
          .includes(selectedCategory.toLowerCase()),
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter !== "All Courses") {
      if (statusFilter === "In Progress") {
        filtered = filtered.filter((c) =>
          userCourses.find((uc) => uc.courseId === c._id && !uc.completed),
        );
      } else if (statusFilter === "Completed") {
        filtered = filtered.filter((c) =>
          userCourses.find((uc) => uc.courseId === c._id && uc.completed),
        );
      } else if (statusFilter === "Not Started") {
        filtered = filtered.filter(
          (c) => !userCourses.find((uc) => uc.courseId === c._id),
        );
      }
    }

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
          <div className="flex relative justify-center py-8 mb-16 w-full px-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A63FF]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <section className="flex relative justify-center py-8 mb-16 w-full px-4 lg:px-6 flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
            {/* Sidebar */}
            <aside
              className="hidden lg:block lg:sticky h-[80vh] top-[90px] w-[200px] xl:w-[240px] flex-shrink-0 overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              <div className="w-full">
                <h2 className="text-xl xl:text-2xl font-mont font-bold mb-4 py-2 text-gray-800 text-center">
                  Categories
                </h2>
                <ul className="w-full overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((category, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setActiveIndex(index);
                        filterCards(
                          index === 0 ? "all" : category.toLowerCase(),
                        );
                      }}
                      className={`py-3 px-4 text-sm xl:text-base cursor-pointer w-full border-b-[0.1px] transition-colors ${
                        index === activeIndex
                          ? "text-[#8A63FF] font-semibold bg-purple-50"
                          : "text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-1 w-full max-w-[1300px]">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                  {filteredCourses.map((course, index) => (
                    <div key={index} className="w-full">
                      <CourseCardWithActions
                        course={course}
                        isSupervised={mode === "supervised"}
                        onCardClick={() => {
                          if (mode === "unsupervised" && course.driveUrl) {
                            navigate("/book");
                          } else if (course._id) {
                            navigate(`/course/${course._id}`);
                          } else {
                            navigate("/carddetail", { state: { course } });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full text-center py-12 text-gray-500">
                  No courses found matching your filters.
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

// ✅ UPDATED CourseCardWithActions Component with 3 States
interface CourseCardWithActionsProps {
  course: Course;
  isSupervised: boolean;
  onCardClick: () => void;
}

const CourseCardWithActions: React.FC<CourseCardWithActionsProps> = ({
  course,
  isSupervised,
  onCardClick,
}) => {
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlist();
  const { data: enrollmentsData } = useEnrollments(); // ✅ Get enrollments

  // ✅ Check if course is in cart (State 2)
  const isInCart =
    cartData?.data?.items?.some((item) => item.course._id === course._id) ||
    false;

  // ✅ Check if course is enrolled (State 3 - after checkout)
  const userEnrollment = enrollmentsData?.data?.find(
    (enrollment: any) => enrollment.courseId._id === course._id,
  );
  const isEnrolled = !!userEnrollment;

  // ✅ Check if course is in wishlist
  const isInWishlist =
    wishlistData?.data?.items?.some((item) => item.course._id === course._id) ||
    false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/Signup", { state: { from: location.pathname } });
      return;
    }

    if (!course._id) {
      toast.error("Course ID not found");
      return;
    }
    addToCartMutation.mutate(course._id);
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!course._id) {
      toast.error("Course ID not found");
      return;
    }
    removeFromCartMutation.mutate(course._id);
  };

  const [isQualified, setIsQualified] = useState(true); // Default true for basic courses
  const [showEntranceModal, setShowEntranceModal] = useState(false);
  const [checkingQualification, setCheckingQualification] = useState(false);

  useEffect(() => {
    const checkQualification = async () => {
      const level = course.level?.toLowerCase() || "";

      // Only check for Intermediate or Advanced courses
      // Beginner courses are automatically qualified (handled in render logic too)
      if (level === "beginner") {
          setIsQualified(true);
          setCheckingQualification(false);
          return;
      }

      if (
        (level === "intermediate" || level === "advanced") &&
        isAuthenticated &&
        course._id
      ) {
        setCheckingQualification(true);
        try {
          const status = await assessmentService.getQualificationStatus(
            course._id,
          );
          setIsQualified(status.qualified);
        } catch (error) {
          console.error("Error checking qualification:", error);
          // If error (e.g. 404 test not found), maybe default to false to be safe?
        } finally {
          setCheckingQualification(false);
        }
      }
    };

    checkQualification();
  }, [course._id, course.level, isAuthenticated]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/Signup", { state: { from: location.pathname } });
      return;
    }

    if (!course._id) {
      toast.error("Course ID not found");
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(course._id);
    } else {
      addToWishlistMutation.mutate(course._id);
    }
  };

  const handleTakeExitTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/Signup", { state: { from: location.pathname } });
      return;
    }
    setShowEntranceModal(true);
  };

  const isWishlistLoading =
    addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  return (
    <div
      className="relative w-full h-full group cursor-pointer"
      onClick={onCardClick}
    >
      <Recard course={course} />

      {isSupervised && (
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex gap-2">
            {/* ✅ THREE STATES: Not in cart, In cart, Enrolled */}
            {isEnrolled ? (
              userEnrollment?.paymentStatus === "completed" ? (
                // ✅ STATE 4: Enrolled & Approved - Show "Access Course" (GREEN/ACTION)
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg text-xs sm:text-sm h-9 px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/course/${course._id}`);
                  }}
                >
                  <span className="hidden sm:inline">Access Course</span>
                  <span className="sm:hidden">Access</span>
                </Button>
              ) : (
                // ✅ STATE 3: Enrolled but Pending - Show "Will be Unlocked Soon" (LOCKED)
                <div className="flex-1 flex flex-col gap-1">
                  <Button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300 shadow-lg text-xs sm:text-sm h-9 px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Lock className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">
                      Will be Unlocked Soon
                    </span>
                    <span className="sm:hidden">Locked</span>
                  </Button>
                  <p className="text-[10px] text-gray-600 text-center">
                    Payment Approval Pending
                  </p>
                </div>
              )
            ) : isInCart ? (
              // ✅ STATE 2: In Cart (before checkout) - Show "Remove from Cart" (RED)
              <Button
                onClick={handleRemoveFromCart}
                disabled={removeFromCartMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg text-xs sm:text-sm h-9 px-3"
              >
                {removeFromCartMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Remove from Cart</span>
                    <span className="sm:hidden">Remove</span>
                  </>
                )}
              </Button>
            ) : !isQualified ? (
              // ✅ STATE 1.5: Entrance Test Required (BLUE)
              <Button
                onClick={handleTakeExitTest}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-xs sm:text-sm h-9 px-3"
              >
                {checkingQualification ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Take Entrance Test</span>
                    <span className="sm:hidden">Test</span>
                  </>
                )}
              </Button>
            ) : (
              // ✅ STATE 1: Default - Show "Add to Cart" (PURPLE)
              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex-1 bg-[#8A63FF] hover:bg-[#7047e0] text-white shadow-lg text-xs sm:text-sm h-9 px-3"
              >
                {addToCartMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">+</span>
                  </>
                )}
              </Button>
            )}

            {/* ✅ Wishlist Button (hide if enrolled) */}
            {!isEnrolled && (
              <Button
                onClick={handleToggleWishlist}
                disabled={isWishlistLoading}
                variant="outline"
                size="icon"
                className={`shadow-lg transition-all duration-200 h-9 w-9 flex-shrink-0 ${
                  isInWishlist
                    ? "bg-red-50 hover:bg-red-100 border-red-400"
                    : "bg-white hover:bg-gray-100 border-gray-300"
                }`}
                title={
                  isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                }
              >
                {isWishlistLoading ? (
                  <div
                    className={`h-4 w-4 border-2 border-t-transparent rounded-full animate-spin ${
                      isInWishlist ? "border-red-600" : "border-[#8A63FF]"
                    }`}
                  />
                ) : (
                  <Heart
                    className={`w-4 h-4 transition-all duration-200 ${
                      isInWishlist
                        ? "text-red-600 fill-red-600"
                        : "text-[#8A63FF]"
                    }`}
                    style={{
                      fill: isInWishlist ? "currentColor" : "none",
                    }}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {showEntranceModal && (
        <EntranceTestModal
          isOpen={showEntranceModal}
          onClose={() => setShowEntranceModal(false)}
          courseId={course._id || ""}
          courseTitle={course.title}
          onPass={() => {
            setIsQualified(true);
            addToCartMutation.mutate(course._id!);
          }}
        />
      )}
    </div>
  );
};

// FilterSection Component (unchanged)
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
    initialActiveButton || "supervised",
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

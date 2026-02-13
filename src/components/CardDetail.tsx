/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { ShoppingCart, Heart, Lock, BookOpen, Video } from "lucide-react";

// Components
import Navbar from "./Navbar";
import WallOfLove from "./WallOfLove";
import PurpleBox from "./PurpleBox";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Services & Hooks
import courseService, { ICourse } from "@/services/courseService";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useCart, useAddToCart, useRemoveFromCart } from "@/hooks/useCart";
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/hooks/useWishlist";
import { useAuth } from "@/App";

// Assets
import Behance from "../Assets/ion_logo-behance.png";
import linkedin from "../Assets/mdi_linkedin.png";
import resume from "../Assets/pepicons-print_cv.png";
import interview from "../Assets/interview.png";
import coc from "../Assets/Group 18504.png";
import reference from "../Assets/Group 18499.png";
import skill from "../Assets/Group 18500.png";
import mentor from "../Assets/Group 18501.png";
import frame from "../Assets/Frame.png";

const CardDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Local State
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accessStatus, setAccessStatus] = useState<{
    access: boolean;
    reason: string;
    batchStartDate?: string;
    googleMeetLink?: string;
    isClassToday?: boolean;
    isActiveSession?: boolean;
    sessionSchedule?: {
      dayOfWeek: string;
      time: string;
      duration: number;
    };
  } | null>(null);
  const [checkingAccess, setCheckingAccess] = useState<boolean>(false);

  // Auth & Global State
  const { isAuthenticated } = useAuth();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useEnrollments();
  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlist();

  // Mutations
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  // Computed Statuses
  const isEnrolled =
    enrollmentsData?.data?.some(
      (enrollment: any) => enrollment.courseId._id === id,
    ) || false;

  const isInCart =
    cartData?.data?.items?.some((item: any) => item.course._id === id) || false;

  const isInWishlist =
    wishlistData?.data?.items?.some((item: any) => item.course._id === id) ||
    false;

  // Format Duration Helper
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
    if (hours > 0) return `${hours} hr`;
    return `${mins} min`;
  };

  // Calculate Price Helper
  const discountedPrice = course?.discount
    ? course.price - course.price * (course.discount / 100)
    : course?.price || 0;

  // Fetch Data
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) {
        setError("Course ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(id);
        console.log(courseData);

        if (!courseData) {
          setError("Course not found");
        } else {
          setCourse(courseData);
        }
      } catch (err: any) {
        console.error("Error fetching course:", err);
        if (err.response?.status === 404) {
          setError("Course not found.");
        } else {
          setError("Failed to load course details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // Check course access when enrolled
  useEffect(() => {
    const checkAccess = async () => {
      if (!id || !isEnrolled || !isAuthenticated) return;

      try {
        setCheckingAccess(true);
        const accessData = await courseService.checkCourseAccess(id);
        setAccessStatus(accessData);
      } catch (err) {
        console.error("Error checking access:", err);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [id, isEnrolled, isAuthenticated]);

  // Handlers
  const handleGoBack = () => navigate("/course");

  const handleAuthRedirect = () => {
    navigate("/Signup", { state: { from: location.pathname } });
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) return handleAuthRedirect();
    if (!id) return toast.error("Invalid Course ID");

    addToCartMutation.mutate(id, {
      onSuccess: () => toast.success("Added to cart!"),
      onError: (err: any) =>
        toast.error(err.response?.data?.message || "Failed to add"),
    });
  };

  const handleRemoveFromCart = () => {
    if (!id) return;
    removeFromCartMutation.mutate(id, {
      onSuccess: () => toast.success("Removed from cart"),
      onError: () => toast.error("Failed to remove"),
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) return handleAuthRedirect();
    if (!id) return;

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(id);
    } else {
      addToWishlistMutation.mutate(id);
    }
  };

  // Render Action Button Logic
  const renderActionButton = () => {
    if (isEnrolled) {
      if (accessStatus?.access) {
        return (
          <Button
            onClick={() => navigate(`/course/${id}/learn`)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold"
          >
            <BookOpen className="w-5 h-5 mr-2 inline" /> Start Learning
          </Button>
        );
      }

      return (
        <div className="w-full">
          <Button
            disabled
            className="w-full bg-gray-300 text-gray-600 cursor-not-allowed py-3 font-semibold"
          >
            <Lock className="w-5 h-5 mr-2 inline" />
            {checkingAccess
              ? "Checking..."
              : accessStatus?.reason || "Access Pending"}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            {accessStatus?.reason === "Payment not completed"
              ? "Your payment is being verified."
              : accessStatus?.batchStartDate
                ? `Batch starts on ${new Date(accessStatus.batchStartDate).toLocaleDateString()}`
                : "Your enrollment is being processed."}
          </p>
        </div>
      );
    }

    if (isInCart) {
      return (
        <Button
          onClick={handleRemoveFromCart}
          disabled={removeFromCartMutation.isPending}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-semibold"
        >
          {removeFromCartMutation.isPending ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2 inline" /> Remove from Cart
            </>
          )}
        </Button>
      );
    }

    return (
      <Button
        onClick={handleAddToCart}
        disabled={addToCartMutation.isPending}
        className="w-full bg-[#8A63FF] hover:bg-[#7A53EF] text-white py-3 font-semibold"
      >
        {addToCartMutation.isPending ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2 inline" /> Add to Cart
          </>
        )}
      </Button>
    );
  };

  // --- SKELETON LOADING STATE ---
  if (loading || enrollmentsLoading) {
    return (
      <div className="flex-col min-h-screen bg-gray-50 font-mont">
        <Navbar />
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-2/3 p-4 lg:p-20">
            <div className="mb-4 flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-10 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-4 mb-8">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md h-64 animate-pulse" />
          </div>
          <div className="hidden lg:flex lg:w-1/3 p-6">
            <div className="w-full bg-white p-6 shadow-lg rounded-lg border border-gray-200 h-96 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !course) {
    return (
      <div className="flex-col min-h-screen bg-gray-50 font-mont">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">
              {error || "Course not found"}
            </div>
            <Button onClick={handleGoBack} className="bg-[#8A63FF] text-white">
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  return (
    <div className="flex-col min-h-[800px] bg-gray-50 font-mont">
      <Navbar />

      {/* Mobile Sticky Bar */}
      {!isEnrolled && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-3 shadow-lg z-50 border-t border-gray-200 flex gap-2">
          <div className="flex-1">{renderActionButton()}</div>
          {!isInCart && (
            <Button
              onClick={handleToggleWishlist}
              disabled={
                addToWishlistMutation.isPending ||
                removeFromWishlistMutation.isPending
              }
              variant="outline"
              size="icon"
              className={`h-12 w-12 flex-shrink-0 ${
                isInWishlist
                  ? "bg-red-50 border-red-400"
                  : "bg-white border-gray-300"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isInWishlist ? "text-red-600 fill-red-600" : "text-[#8A63FF]"}`}
              />
            </Button>
          )}

          {/* Mobile Join Mentoring Class Button */}
          {isEnrolled && accessStatus?.googleMeetLink && (
            <div className="relative flex-1">
              {accessStatus.isActiveSession && (
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-75 blur animate-pulse" />
              )}
              <Button
                onClick={() =>
                  window.open(accessStatus.googleMeetLink, "_blank")
                }
                className={`w-full relative py-3 font-semibold ${
                  accessStatus.isActiveSession
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Video className="w-5 h-5 mr-2 inline" />
                {accessStatus.isClassToday ? "Live" : "Join Class"}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Left Column: Content */}
        <div className="w-full lg:w-2/3 p-4 lg:p-20 pb-20 lg:pb-4">
          {/* Breadcrumbs / Tags */}
          <div className="mb-4 flex flex-wrap items-center gap-2 lg:gap-3">
            <Button
              onClick={handleGoBack}
              className="flex items-center bg-[#8A63FF] text-white text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full hover:bg-[#6D28D9] transition"
            >
              <IoArrowBack className="mr-1" /> Back
            </Button>
            <span className="bg-[#8A63FF] text-white text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full capitalize">
              {course.level} Level
            </span>
            {course.category && (
              <span className="bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-1 rounded-full">
                {course.category}
              </span>
            )}
          </div>

          <h1 className="text-2xl lg:text-4xl font-bold text-black mb-4">
            {course.title}
          </h1>
          <p className="text-gray-600 text-sm lg:text-base mb-6">
            {course.description}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-semibold mr-1">Duration:</span>{" "}
              {course.totalWeeks} weeks
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">Students:</span>{" "}
              {course.enrolledUsers?.length || 0}
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white p-6 lg:p-16 shadow-lg rounded-lg">
            {/* What You'll Learn - Technologies and Learning Objectives */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[#8A63FF]">
                  What You'll Learn
                </h2>
                <p>Key topics and skills you'll master:</p>
              </div>

              {(course.technologies && course.technologies.length > 0) ||
              (course.learningObjectives &&
                course.learningObjectives.length > 0) ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Map Technologies */}
                  {course.technologies?.map((tech: string, index: number) => (
                    <li
                      key={`tech-${index}`}
                      className="flex items-start gap-3 text-gray-600"
                    >
                      <img
                        src={frame}
                        alt="bullet"
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm lg:text-base">{tech}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  Course details coming soon.
                </p>
              )}
            </div>
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[#8A63FF]">
                  Learning Objectives
                </h2>
                <p>What you'll achive:</p>
              </div>
              {course.learningObjectives &&
              course.learningObjectives.length > 0 ? (
                <div className="my-4">
                  {/* Map Learning Objectives */}
                  {course.learningObjectives?.map(
                    (objective: string, index: number) => (
                      <div
                        key={`objective-${index}`}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <img
                          src={frame}
                          alt="bullet"
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm lg:text-base">
                          {objective}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Course details coming soon.
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 my-8"></div>

            {/* Value Props */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#8A63FF] mb-6">
                VALUE BEYOND THE CLASSROOM
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    img: Behance,
                    title: "Behance Profile",
                    desc: "Showcase projects",
                  },
                  {
                    img: linkedin,
                    title: "LinkedIn Profile",
                    desc: "Highlight skills",
                  },
                  {
                    img: resume,
                    title: "Resume Building",
                    desc: "Master resume",
                  },
                  {
                    img: interview,
                    title: "Interview Prep",
                    desc: "Mock interviews",
                  },
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-2">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-12 h-12 mx-auto"
                    />
                    <p className="text-gray-800 font-semibold text-sm">
                      {item.title}
                    </p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 my-8"></div>

            {/* Deliverables */}
            <div>
              <h2 className="text-xl font-semibold text-[#8A63FF] mb-6">
                What You'll Get
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { img: coc, title: "Certificate", desc: "Validate skills" },
                  {
                    img: reference,
                    title: "Resources",
                    desc: "Comprehensive material",
                  },
                  {
                    img: skill,
                    title: "Assessment",
                    desc: "Evaluate expertise",
                  },
                  { img: mentor, title: "Mentorship", desc: "Expert guidance" },
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-2">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-12 h-12 mx-auto"
                    />
                    <p className="text-gray-800 font-semibold text-sm">
                      {item.title}
                    </p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar (Desktop) */}
        <div className="hidden lg:flex lg:w-1/3 items-start justify-center p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="w-full bg-white p-6 shadow-xl rounded-xl border border-[#8A63FF4D]">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {course.title}
              </h2>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                Instructor:{" "}
                <span className="font-medium text-gray-800 ml-1">
                  {course.instructor?.name || "Expert Instructor"}
                </span>
              </div>

              {isEnrolled ? (
                <div
                  className={`flex items-center gap-2 font-medium p-3 rounded-lg ${
                    accessStatus?.access
                      ? "text-green-700 bg-green-50"
                      : "text-yellow-600 bg-yellow-50"
                  }`}
                >
                  {accessStatus?.access ? (
                    <>
                      <BookOpen className="w-4 h-4" /> Access Granted
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {checkingAccess
                        ? "Checking..."
                        : accessStatus?.reason || "Pending Activation"}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                  {course.discount > 0 && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{course.price.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {course.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {renderActionButton()}

              {/* Join Mentoring Class Button */}
              {isEnrolled && accessStatus?.googleMeetLink && (
                <div className="relative">
                  {accessStatus.isActiveSession && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-75 blur animate-pulse" />
                  )}
                  <Button
                    onClick={() =>
                      window.open(accessStatus.googleMeetLink, "_blank")
                    }
                    className={`w-full relative py-3 font-semibold ${
                      accessStatus.isActiveSession
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <Video className="w-5 h-5 mr-2 inline" />
                    Join Mentoring Class
                    {accessStatus.isClassToday && (
                      <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        Live Now
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {!isEnrolled && !isInCart && (
                <Button
                  onClick={handleToggleWishlist}
                  disabled={
                    addToWishlistMutation.isPending ||
                    removeFromWishlistMutation.isPending
                  }
                  variant="outline"
                  className={`w-full py-3 ${
                    isInWishlist
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "border-gray-300"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 mr-2 ${isInWishlist ? "fill-red-600 text-red-600" : "text-[#8A63FF]"}`}
                  />
                  {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
              )}
            </div>

            <div className="mt-6 text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium text-gray-900">
                  {course.totalWeeks} weeks
                </span>
              </div>
              <div className="flex justify-between">
                <span>Level</span>
                <span className="font-medium text-gray-900 capitalize">
                  {course.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Enrolled</span>
                <span className="font-medium text-gray-900">
                  {course.enrolledUsers?.length || 0} students
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WallOfLove />
      <div className="flex justify-center mb-20 lg:mb-0">
        <PurpleBox />
      </div>
      <Footer />
    </div>
  );
};

export default CardDetail;

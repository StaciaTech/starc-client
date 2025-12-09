/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import WallOfLove from "./WallOfLove";
import PurpleBox from "./PurpleBox";
import Footer from "./Footer";
import Behance from "../Assets/ion_logo-behance.png";
import linkedin from "../Assets/mdi_linkedin.png";
import resume from "../Assets/pepicons-print_cv.png";
import interview from "../Assets/interview.png";
import coc from "../Assets/Group 18504.png";
import reference from "../Assets/Group 18499.png";
import skill from "../Assets/Group 18500.png";
import mentor from "../Assets/Group 18501.png";
import frame from "../Assets/Frame.png";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Navbar from "./Navbar";
import courseService, { ICourse } from "@/services/courseService";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Heart, Lock } from "lucide-react"; // ✅ Added Lock icon
import { useAddToCart, useRemoveFromCart } from "../hooks/useCart";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "../hooks/useWishlist";
import { useAuth } from "@/App";

const CardDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Auth state
  const { isAuthenticated } = useAuth();

  // ✅ Enrollment, cart, and wishlist data
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useEnrollments();
  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlist();

  // ✅ Mutations for cart and wishlist
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  // ✅ Check enrollment status (after checkout)
  const isEnrolled =
    enrollmentsData?.data?.some(
      (enrollment: any) => enrollment.courseId._id === id
    ) || false;

  // ✅ Check if course is in cart (before checkout)
  const isInCart =
    cartData?.data?.items?.some((item: any) => item.course._id === id) || false;

  // ✅ Check wishlist status
  const isInWishlist =
    wishlistData?.data?.items?.some((item: any) => item.course._id === id) ||
    false;

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) {
        console.error("Course ID is undefined or null");
        setError("Course ID not found in URL parameters");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching course with ID: ${id}`);
        setLoading(true);
        const courseData = await courseService.getCourseById(id);

        if (!courseData) {
          console.error("Course data is empty or undefined");
          setError("Course not found");
          setLoading(false);
          return;
        }

        console.log("Course data fetched successfully:", courseData);
        setCourse(courseData);
      } catch (err: any) {
        console.error("Error fetching course details:", err);

        if (err.response) {
          if (err.response.status === 404) {
            setError("Course not found. It may have been deleted or moved.");
          } else {
            setError(
              `Failed to load course details: ${
                err.response.data.message || "Server error"
              }`
            );
          }
        } else if (err.request) {
          setError(
            "Network error. Please check your connection and try again."
          );
        } else {
          setError("Failed to load course details. Please try again.");
        }

        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // ✅ Handlers
  const handleGoBack = () => {
    navigate("/course");
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/Signup", { state: { from: `/course/${id}` } });
      return;
    }

    if (!id) {
      toast.error("Course ID not found");
      return;
    }

    addToCartMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Course added to cart!");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to add to cart");
      },
    });
  };

  const handleRemoveFromCart = () => {
    if (!id) {
      toast.error("Course ID not found");
      return;
    }

    removeFromCartMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Course removed from cart!");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to remove from cart"
        );
      },
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/Signup", { state: { from: `/course/${id}` } });
      return;
    }

    if (!id) {
      toast.error("Course ID not found");
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(id);
    } else {
      addToWishlistMutation.mutate(id);
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${
        mins > 1 ? "s" : ""
      }`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${mins} minute${mins > 1 ? "s" : ""}`;
    }
  };

  // Calculate discounted price
  const discountedPrice = course?.discount
    ? course.price - course.price * (course.discount / 100)
    : course?.price || 0;

  // ✅ Render action buttons based on THREE states
  const renderActionButton = () => {
    // ✅ STATE 3: After checkout - Show LOCKED (Will be Unlocked Soon)
    if (isEnrolled) {
      return (
        <div className="w-full">
          <Button
            disabled
            className="w-full bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300 py-3 rounded-lg font-semibold"
          >
            <Lock className="w-5 h-5 mr-2 inline" />
            Will be Unlocked Soon
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Our team will contact you shortly to unlock your course access
          </p>
        </div>
      );
    }

    // ✅ STATE 2: In cart - Show "Remove from Cart" (RED)
    if (isInCart) {
      return (
        <Button
          onClick={handleRemoveFromCart}
          disabled={removeFromCartMutation.isPending}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
        >
          {removeFromCartMutation.isPending ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2 inline" />
              Remove from Cart
            </>
          )}
        </Button>
      );
    }

    // ✅ STATE 1: Default - Show "Add to Cart" (PURPLE)
    return (
      <Button
        onClick={handleAddToCart}
        disabled={addToCartMutation.isPending}
        className="w-full bg-[#8A63FF] text-white py-3 rounded-lg font-semibold hover:bg-[#7A53EF] transition"
      >
        {addToCartMutation.isPending ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2 inline" />
            Add to Cart
          </>
        )}
      </Button>
    );
  };

  // Loading state
  // Loading state
  if (loading || enrollmentsLoading) {
    return (
      <div className="flex-col min-h-screen bg-gray-50 font-mont">
        <Navbar />
        <div className="flex flex-col lg:flex-row">
          {/* Main Content Skeleton */}
          <div className="w-full lg:w-2/3 p-4 lg:p-20">
            {/* Back button skeleton */}
            <div className="mb-4 flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Title skeleton */}
            <div className="h-10 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-4"></div>

            {/* Description skeleton */}
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Course details skeleton */}
            <div className="flex gap-4 mb-8">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Content card skeleton */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="hidden lg:flex lg:w-1/3 items-start justify-center p-6">
            <div className="w-full bg-white p-6 shadow-lg rounded-lg border border-gray-200">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mb-3"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="flex-col min-h-screen bg-gray-50 font-mont">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">
              {error || "Course not found"}
            </div>
            <Button
              onClick={handleGoBack}
              className="bg-[#8A63FF] text-white px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col min-h-[800px] bg-gray-50 font-mont">
      <Navbar />

      {/* ✅ Mobile Sticky Bottom Bar - Hidden if enrolled */}
      {!isEnrolled && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-3 shadow-lg z-50 border-t border-gray-200">
          <div className="flex gap-2">
            {/* Action Button */}
            <div className="flex-1">{renderActionButton()}</div>

            {/* Wishlist Button - Hide if in cart */}
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
                    ? "bg-red-50 hover:bg-red-100 border-red-400"
                    : "bg-white hover:bg-gray-100 border-gray-300"
                }`}
              >
                {addToWishlistMutation.isPending ||
                removeFromWishlistMutation.isPending ? (
                  <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin border-[#8A63FF]" />
                ) : (
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist
                        ? "text-red-600 fill-red-600"
                        : "text-[#8A63FF]"
                    }`}
                    style={{ fill: isInWishlist ? "currentColor" : "none" }}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3 p-4 lg:p-20 pb-20 lg:pb-4">
          {/* Back Button and Tags */}
          <div className="mb-4 flex flex-wrap items-center gap-2 lg:gap-3">
            <Button
              onClick={handleGoBack}
              className="flex items-center bg-[#8A63FF] text-white text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full hover:bg-[#6D28D9] transition"
            >
              <IoArrowBack className="mr-1" />
              Back
            </Button>
            <span className="inline-block bg-[#8A63FF] text-white text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full">
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}{" "}
              Level
            </span>
            {course.category && (
              <span className="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1.5 lg:px-4 lg:py-1 rounded-full">
                {course.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-4xl font-bold text-black mb-4 lg:mb-6">
            {course.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-sm lg:text-base mb-6 lg:mb-8">
            {course.description}
          </p>

          {/* Course Details */}
          <div className="flex flex-wrap items-center gap-3 mb-6 lg:mb-8 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-semibold mr-1">Duration:</span>{" "}
              {formatDuration(course.duration)}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">Rating:</span>{" "}
              {course.rating?.toFixed(1) || "0.0"}/5
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">Students:</span>{" "}
              {course.enrolledUsers?.length || 0}
            </div>
          </div>

          {/* Course Content */}
          <div className="bg-white p-4 lg:p-16 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-lg">
            {/* What You'll Learn */}
            <div className="mb-6 lg:mb-8">
              <div className="grid grid-cols-1 mb-4 w-full">
                <h2 className="text-lg lg:text-xl font-semibold text-[#8A63FF]">
                  What You'll Learn
                </h2>
                <p className="">{course.title} Fundamentals:</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-4">
                {course.lessons && course.lessons.length > 0 ? (
                  <ul className="space-y-3 lg:space-y-5 mb-4 md:mb-0">
                    {course.lessons
                      .slice(0, Math.ceil(course.lessons.length / 2))
                      .map((lesson: any, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm lg:text-base text-gray-600"
                        >
                          <div className="flex items-center justify-center">
                            <img
                              src={frame}
                              alt=""
                              className="w-4 h-4 lg:w-5 lg:h-5"
                            />
                          </div>
                          {lesson.title}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm lg:text-base">
                    Lesson content will be available soon.
                  </p>
                )}

                {course.lessons && course.lessons.length > 1 && (
                  <ul className="space-y-3 lg:space-y-5">
                    {course.lessons
                      .slice(Math.ceil(course.lessons.length / 2))
                      .map((lesson: any, index) => (
                        <li
                          key={`second-${index}`}
                          className="flex items-center text-sm lg:text-base text-gray-600"
                        >
                          <div className="flex items-center justify-center">
                            <img
                              src={frame}
                              alt=""
                              className="w-4 h-4 lg:w-5 lg:h-5"
                            />
                          </div>
                          {lesson.title}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mt-6 lg:mt-8 pt-6 lg:pt-8"></div>

            {/* Value Beyond Classroom */}
            <div className="mb-6 lg:mb-8">
              <h2 className="text-lg lg:text-xl font-semibold text-[#8A63FF] mb-4">
                VALUE BEYOND THE CLASSROOM
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={Behance} alt="" className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">
                    Behance Profile
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Showcase projects, collaborate, network
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={linkedin} alt="" className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">
                    LinkedIn Profile
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Highlight skills, projects
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={resume} alt="" className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">
                    Resume Building
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Master communication skills
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={interview} alt="" className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">
                    Interview Prep
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Mock interviews, feedback
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-6 lg:mt-8 pt-6 lg:pt-8"></div>

            {/* What You'll Get */}
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-[#8A63FF] mb-4">
                What You'll Get
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={coc} alt="" className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">
                    Certificate
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Validate your skills
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={reference} alt="" className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">
                    Reference Materials
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Comprehensive resources
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={skill} alt="" className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">
                    Skill Assessment
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Evaluate your expertise
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={mentor} alt="" className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 font-mont font-semibold text-sm lg:text-base">
                    Mentorship
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Expert guidance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-1/3 items-start justify-center p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="w-full bg-white p-6 shadow-lg rounded-lg border border-[#8A63FF4D]">
            {/* Course Info Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {course.title}
              </h2>
              <div className="flex items-center mb-2">
                <span className="text-gray-600 text-sm">Instructor: </span>
                <span className="text-gray-800 text-sm ml-1 font-medium">
                  {course.instructor?.name || "Expert Instructor"}
                </span>
              </div>

              {/* ✅ Show enrollment status if enrolled */}
              {isEnrolled && (
                <div className="flex items-center mb-4">
                  <span className="text-gray-600 text-sm">Status: </span>
                  <span className="text-yellow-600 text-sm ml-1 font-medium">
                    ⏳ Pending Activation
                  </span>
                </div>
              )}

              {/* ✅ Show price if not enrolled */}
              {!isEnrolled && (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {course.discount && course.discount > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-gray-800">
                          ₹{discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-lg text-gray-500 line-through ml-2">
                          ₹{course.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-green-600 ml-2">
                          ({course.discount}% off)
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-800">
                        ₹{course.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {renderActionButton()}

              {/* ✅ Only show wishlist if not enrolled */}
              {!isEnrolled && !isInCart && (
                <Button
                  onClick={handleToggleWishlist}
                  disabled={
                    addToWishlistMutation.isPending ||
                    removeFromWishlistMutation.isPending
                  }
                  variant="outline"
                  className={`w-full ${
                    isInWishlist
                      ? "bg-red-50 hover:bg-red-100 border-red-400 text-red-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {addToWishlistMutation.isPending ||
                  removeFromWishlistMutation.isPending ? (
                    <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin border-[#8A63FF] mx-auto" />
                  ) : (
                    <>
                      <Heart
                        className={`w-5 h-5 mr-2 ${
                          isInWishlist ? "fill-red-600" : ""
                        }`}
                        style={{ fill: isInWishlist ? "currentColor" : "none" }}
                      />
                      {isInWishlist
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Course Details */}
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <span className="font-semibold mr-2">Duration:</span>
                <span>{formatDuration(course.duration)}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Level:</span>
                <span className="capitalize">{course.level}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Students:</span>
                <span>{course.enrolledUsers?.length || 0}</span>
              </div>
            </div>
          </div>
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

export default CardDetail;

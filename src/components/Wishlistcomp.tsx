import React, { useState, useEffect } from "react";
import { Trash2, ShoppingCart, CreditCard, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist, useRemoveFromWishlist, useMoveToCart } from "@/hooks/useWishlist";
import { getUserProfile, UserProfile } from "@/services/profileService";

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch live wishlist details
  const { data: wishlistData, isLoading, isError } = useWishlist();

  // Mutations
  const removeMutation = useRemoveFromWishlist();
  const moveToCartMutation = useMoveToCart();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching user profile in wishlist:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleRemove = (courseId: string) => {
    removeMutation.mutate(courseId);
  };

  const handleAddToCart = (courseId: string) => {
    moveToCartMutation.mutate(courseId);
  };

  const handleBuyNow = (courseId: string) => {
    moveToCartMutation.mutate(courseId, {
      onSuccess: () => {
        navigate("/check-out");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <p className="text-red-500 text-lg font-semibold">Failed to load wishlist.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const items = wishlistData?.data?.items || [];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 font-mont">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6 lg:p-8 bg-white shadow-md rounded-lg mb-6 lg:mb-8">
          <img
            src={userProfile?.avatar || "/placeholder.svg"}
            alt="Profile"
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-2 border-purple-600"
          />
          <div className="text-center sm:text-left space-y-2">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
              {userProfile?.name || "Student"}
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              {userProfile?.bio || userProfile?.role || "Web Academy Student"}
              <Link
                to="/profile"
                className="text-purple-600 hover:underline ml-2 font-medium"
              >
                view profile
              </Link>
            </p>
          </div>
        </div>

        {/* Wishlist Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              WISHLIST{" "}
              <span className="text-purple-600">[{items.length}]</span>
            </h3>
          </div>

          {/* Desktop Table Header - Hidden on mobile */}
          {items.length > 0 && (
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 font-semibold text-gray-600 text-sm mb-4 pb-4 border-b border-gray-300">
              <div className="col-span-6">COURSE</div>
              <div className="col-span-2 text-center">PRICE</div>
              <div className="col-span-4 text-center">ACTIONS</div>
            </div>
          )}

          {/* Course List */}
          <div className="space-y-4">
            {items.map((item) => {
              const { course } = item;
              if (!course) return null;

              return (
                <div
                  key={item._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                    {/* Course Info */}
                    <div className="col-span-6 flex gap-4">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-24 h-16 sm:w-28 sm:h-20 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            by {course.instructor}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 mt-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {course.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center">
                      <p className="text-lg font-bold text-purple-600">
                        ${course.discountedPrice.toFixed(2)}
                      </p>
                      {course.discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ${course.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-4 flex justify-center gap-2">
                      {/* <button
                        onClick={() => handleBuyNow(course._id)}
                        disabled={moveToCartMutation.isPending}
                        className="text-purple-600 px-3 py-2 rounded text-sm bg-gray-100 hover:bg-purple-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="hidden xl:inline">Buy Now</span>
                      </button> */}
                      <button
                        onClick={() => handleAddToCart(course._id)}
                        disabled={moveToCartMutation.isPending}
                        className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden xl:inline">Add to Cart</span>
                      </button>
                      <button
                        onClick={() => handleRemove(course._id)}
                        disabled={removeMutation.isPending}
                        className="text-red-600 px-3 py-2 rounded text-sm bg-gray-100 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile/Tablet Layout */}
                  <div className="lg:hidden space-y-4">
                    {/* Course Image and Info */}
                    <div className="flex gap-3">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 mb-1">
                          {course.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          by {course.instructor}
                        </p>
                        <div className="flex items-center text-xs text-gray-600">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {course.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-lg sm:text-xl font-bold text-purple-600">
                          ${course.discountedPrice.toFixed(2)}
                        </p>
                        {course.discount > 0 && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through">
                            ${course.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(course._id)}
                          disabled={moveToCartMutation.isPending}
                          className="bg-purple-600 text-white px-3 py-2 sm:px-4 rounded text-xs sm:text-sm hover:bg-purple-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                        <button
                          onClick={() => handleRemove(course._id)}
                          disabled={removeMutation.isPending}
                          className="text-red-600 px-3 py-2 rounded text-xs sm:text-sm bg-gray-100 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Buy Now Button - Full Width on Mobile */}
                    {/* <button
                      onClick={() => handleBuyNow(course._id)}
                      disabled={moveToCartMutation.isPending}
                      className="w-full text-purple-600 px-4 py-2.5 rounded text-sm font-medium bg-gray-100 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      Buy Now
                    </button> */}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Your wishlist is empty</p>
              <Link
                to="/course"
                className="inline-block mt-4 text-purple-600 hover:underline font-medium"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

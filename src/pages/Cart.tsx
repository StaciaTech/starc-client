import React, { useState } from "react";
import {
  Trash2,
  ShoppingBag,
  Star,
  Loader2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, useRemoveFromCart, useClearCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useQueryClient } from "@tanstack/react-query"; // ✅ Import

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // ✅ Get query client

  // ✅ Use TanStack Query hooks
  const { data: cartData, isLoading, error } = useCart();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  // ✅ Checkout states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Extract cart items and summary
  const cartItems = cartData?.data?.items || [];
  const summary = cartData?.data?.summary;

  // Handle remove item
  const handleRemoveItem = (courseId: string) => {
    removeFromCartMutation.mutate(courseId);
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCartMutation.mutate();
    }
  };

  // ✅ Handle Checkout
  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/cart/checkout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrderId(response.data.data.orderId);

        // ✅ Invalidate queries to refetch fresh data
        await queryClient.invalidateQueries({ queryKey: ["cart"] });
        await queryClient.invalidateQueries({ queryKey: ["enrollments"] });

        console.log(
          "✅ Queries invalidated - cart and enrollments will refetch"
        );

        setShowSuccessModal(true);
        toast.success("Registration successful! Check your email.");

        // Auto redirect after 8 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("/course");
        }, 8000);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message || "Checkout failed. Please try again."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Failed to load cart
            </h3>
            <p className="text-gray-500 mb-6">Please try again later</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ✅ Success Modal
  if (showSuccessModal) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-green-500">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="h-20 w-20 text-green-600" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Registration Successful! 🎉
              </h2>

              {/* Order ID */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <p className="text-sm text-purple-600 font-semibold mb-2">
                  Your Order ID
                </p>
                <p className="text-3xl font-bold text-purple-900 font-mono tracking-wider">
                  {orderId}
                </p>
              </div>

              {/* Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg text-gray-800 font-semibold mb-2">
                      You are registered for the selected courses!
                    </p>
                    <p className="text-gray-600">
                      For payment details and further information, our team will
                      contact you shortly via email or phone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-bold text-gray-900 text-lg mb-4">
                  📋 What's Next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <p className="text-gray-700 pt-1">
                      Check your email for order confirmation
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <p className="text-gray-700 pt-1">
                      Our team will reach out within 24-48 hours
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <p className="text-gray-700 pt-1">
                      Complete the payment process
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <p className="text-gray-700 pt-1">
                      Get instant access to your courses
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/course")}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                >
                  Browse More Courses
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="border-gray-300 px-8 py-3"
                >
                  Go to Home
                </Button>
              </div>

              {/* Auto redirect message */}
              <p className="text-sm text-gray-500 mt-6">
                Redirecting to courses page in a few seconds...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8" />
                Courses in your Cart
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "course" : "courses"} in your cart
              </p>
            </div>

            {/* Clear Cart Button */}
            {cartItems.length > 0 && (
              <Button
                onClick={handleClearCart}
                disabled={clearCartMutation.isPending}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {clearCartMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cart
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.course._id}
                    className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:flex gap-4 items-start">
                      <img
                        src={item.course.thumbnail || "/placeholder-course.jpg"}
                        alt={item.course.title}
                        className="w-40 h-28 object-cover rounded flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => navigate(`/course/${item.course._id}`)}
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-base lg:text-lg font-semibold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => navigate(`/course/${item.course._id}`)}
                        >
                          {item.course.title}
                        </h3>

                        {/* Course description */}
                        {item.course.description && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {item.course.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {item.course.rating && (
                            <>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="font-semibold">
                                  {item.course.rating}
                                </span>
                              </div>
                              <span className="text-gray-400">•</span>
                            </>
                          )}

                          {item.course.duration && (
                            <>
                              <span>{item.course.duration}</span>
                              <span className="text-gray-400">•</span>
                            </>
                          )}

                          {item.course.level && (
                            <span className="capitalize">
                              {item.course.level}
                            </span>
                          )}
                        </div>

                        {/* Show discount badge if applicable */}
                        {item.course.discount > 0 && (
                          <div className="mt-2">
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                              {item.course.discount}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            ${item.course.discountedPrice?.toFixed(2) || "0.00"}
                          </p>
                          {item.course.discount > 0 && item.course.price && (
                            <p className="text-sm text-gray-400 line-through">
                              ${item.course.price.toFixed(2)}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={() => handleRemoveItem(item.course._id)}
                          disabled={removeFromCartMutation.isPending}
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-50"
                        >
                          {removeFromCartMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-4">
                      <div className="flex gap-3">
                        <img
                          src={
                            item.course.thumbnail || "/placeholder-course.jpg"
                          }
                          alt={item.course.title}
                          className="w-24 h-20 object-cover rounded flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/course/${item.course._id}`)}
                        />
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 cursor-pointer"
                            onClick={() =>
                              navigate(`/course/${item.course._id}`)
                            }
                          >
                            {item.course.title}
                          </h3>

                          {item.course.rating && (
                            <div className="flex items-center text-xs text-gray-600 mb-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                              {item.course.rating}
                            </div>
                          )}

                          {item.course.discount > 0 && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-1.5 py-0.5 rounded">
                              {item.course.discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-lg font-bold text-purple-600">
                            ${item.course.discountedPrice?.toFixed(2) || "0.00"}
                          </p>
                          {item.course.discount > 0 && item.course.price && (
                            <p className="text-xs text-gray-400 line-through">
                              ${item.course.price.toFixed(2)}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={() => handleRemoveItem(item.course._id)}
                          disabled={removeFromCartMutation.isPending}
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-50"
                        >
                          {removeFromCartMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Empty Cart */
                <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
                  <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some courses to get started!
                  </p>
                  <Link to="/course">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cartItems.length > 0 && summary && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Original Price</span>
                      <span className="font-semibold">
                        ${summary.totalPrice?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    {summary.totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-semibold">
                          -${summary.totalDiscount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>GST</span>
                      <span className="font-semibold">18%</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800">
                        <span>Total</span>
                        <span className="text-purple-600">
                          $
                          {(
                            summary.finalPrice +
                            summary.finalPrice * 0.18
                          )?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {summary.itemCount}{" "}
                        {summary.itemCount === 1 ? "course" : "courses"}
                      </p>
                    </div>
                  </div>

                  {/* ✅ Info Alert */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Our team will contact you for payment and enrollment
                        details
                      </p>
                    </div>
                  </div>

                  {/* ✅ Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-base font-semibold mb-3"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Register for Courses
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <Link to="/course">
                    <Button
                      variant="outline"
                      className="w-full text-purple-600 border-purple-300 hover:bg-purple-50 py-3"
                    >
                      Continue Shopping
                    </Button>
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center mb-3">
                      Secure Registration
                    </p>
                    <div className="flex justify-center gap-3 text-gray-400">
                      <div className="text-2xl">🔒</div>
                      <div className="text-2xl">✉️</div>
                      <div className="text-2xl">✓</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;

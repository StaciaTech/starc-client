import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Lock,
  Check,
  AlertCircle,
  Tag,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

interface CartCourse {
  _id: string;
  title: string;
  thumbnail: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  duration: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    // Billing Address
    country: "IN",
    state: "",
    // Payment
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Mock cart data - Replace with actual cart from context/state
  const [cartCourses] = useState<CartCourse[]>([
    {
      _id: "1",
      title: "Complete Web Development Bootcamp 2025",
      thumbnail: "/placeholder.svg",
      instructor: "Dr. Angela Yu",
      price: 3499,
      originalPrice: 8999,
      rating: 4.7,
      duration: "65 hours",
    },
    {
      _id: "2",
      title: "React - The Complete Guide 2025",
      thumbnail: "/placeholder.svg",
      instructor: "Maximilian Schwarzmüller",
      price: 3299,
      originalPrice: 7999,
      rating: 4.8,
      duration: "48 hours",
    },
  ]);

  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Calculate totals
  const subtotal = cartCourses.reduce((sum, course) => sum + course.price, 0);
  const discount = appliedCoupon ? subtotal * 0.1 : 0; // 10% discount example
  const tax = (subtotal - discount) * 0.18; // 18% GST
  const total = subtotal - discount + tax;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "efiai10") {
      setAppliedCoupon(couponCode);
      toast.success("Coupon applied successfully! 10% off");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // TODO: Integrate payment gateway (Razorpay/Stripe)
      // const response = await paymentService.processPayment(formData, cartCourses, total);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Payment successful! Redirecting to your courses...");

      // Redirect to success page or my courses
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
              Checkout
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Complete your purchase and start learning today
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">
                  Payment Method
                </h2>

                {/* Payment Options */}
                <div className="space-y-4 mb-6">
                  <label className="flex items-center p-4 border-2 border-[#8A63FF] bg-purple-50 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      defaultChecked
                      className="w-5 h-5 text-[#8A63FF]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#8A63FF]" />
                        <span className="font-semibold text-gray-800">
                          Credit / Debit Card
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      className="w-5 h-5 text-[#8A63FF]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">UPI</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Popular
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PhonePe, Google Pay, Paytm
                      </p>
                    </div>
                  </label>
                </div>

                {/* Card Details Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                        maxLength={19}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A63FF] focus:border-transparent transition-all"
                        placeholder="1234 5678 9012 3456"
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A63FF] focus:border-transparent transition-all"
                      placeholder="Name on card"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A63FF] focus:border-transparent transition-all"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A63FF] focus:border-transparent transition-all"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        Secure Payment Processing
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Your payment information is encrypted and secured with
                        SSL technology.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

                {/* Cart Courses */}
                <div className="space-y-4 mb-6">
                  {cartCourses.map((course) => (
                    <div key={course._id} className="flex gap-3">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          By {course.instructor}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-gray-900">
                            ${course.price}
                          </span>
                          {course.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ${course.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  {/* <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8A63FF] focus:border-transparent"
                      disabled={!!appliedCoupon}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!!appliedCoupon}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:bg-gray-400"
                    >
                      Apply
                    </button>
                  </div> */}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                      <Tag className="w-4 h-4" />
                      <span>Coupon "{appliedCoupon}" applied!</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST 18%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-[#8A63FF]">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Payment Button */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-[#8A63FF] text-white px-6 py-4 rounded-lg hover:bg-[#7047e0] transition-all font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Complete Payment
                    </>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="block w-full text-[#8A63FF] text-center px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors font-medium mt-3"
                >
                  Back to Cart
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Lock className="w-4 h-4" />
                    <span>SSL Secured Payment</span>
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <div className="px-3 py-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                      VISA
                    </div>
                    <div className="px-3 py-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                      Mastercard
                    </div>
                    <div className="px-3 py-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                      Rupay
                    </div>
                    <div className="px-3 py-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                      UPI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

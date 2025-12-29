import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Vector from "../Assets/Vector-3.png";
import Star from "../Assets/star.png";
import Login from "../components/Login";
import authService from "@/services/authService";
import { toast } from "sonner";
import { API_URL } from "@/config/api";
import axios from "axios";

interface Slide {
  title: string;
  description: string;
}

type SignupStep = 1 | 2 | 3;

const Signup: React.FC = () => {
  const [view, setView] = useState<"signup" | "login">("signup");
  const [step, setStep] = useState<SignupStep>(1);

  // Form data
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // UI states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);

  // Validation states
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const slides: Slide[] = [
    {
      title: "Lorem ipsum dolor sit amet consectetur.",
      description:
        "Lorem ipsum dolor sit amet consectetur. Arcu a sit commodo tempor nulla blandit. Posuere vel netus auctor phasellus fermentum.",
    },
    {
      title: "Discover New Learning Paths Today",
      description:
        "Unlock your potential with our curated courses. Learn at your own pace with expert guidance and support.",
    },
    {
      title: "Master Skills with Expert Mentors",
      description:
        "Join thousands of learners and gain skills that matter. Start your journey with hands-on projects.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [skipTransition, setSkipTransition] = useState(false);

  // Carousel effect
  useEffect(() => {
    const interval = 3000;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        if (prevSlide === slides.length - 1) {
          setSkipTransition(true);
          setTimeout(() => setSkipTransition(false), 0);
          return 0;
        }
        return (prevSlide + 1) % slides.length;
      });
    }, interval);

    return () => clearInterval(slideTimer);
  }, [slides.length]);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Validation regex
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex: RegExp = /^[0-9]{10}$/;
  const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  // ==================== STEP 1: SEND OTP ====================
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validEmail = emailRegex.test(email);
    const validPhone = phoneRegex.test(phone);

    setIsEmailValid(validEmail);
    setIsPhoneValid(validPhone);

    if (!validEmail || !validPhone || !name.trim()) {
      toast.error("Please fill all fields correctly");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
      });

      if (response.data.success) {
        toast.success(response.data.message || "OTP sent to your email!");
        setOtpTimer(response.data.data.expiresIn || 600); // Set countdown timer
        setStep(2);
      }
    } catch (error: any) {
      console.error("Send OTP error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== STEP 2: VERIFY OTP ====================
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
      });

      if (response.data.success) {
        toast.success(response.data.message || "OTP verified successfully!");
        setStep(3);
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(errorMessage);

      // If OTP expired, allow user to resend
      if (error.response?.data?.expired) {
        setOtpTimer(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== STEP 2.5: RESEND OTP ====================
  const handleResendOTP = async () => {
    if (otpTimer > 0) {
      toast.info(`Please wait ${otpTimer} seconds before resending`);
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: email.toLowerCase().trim(),
      });

      if (response.data.success) {
        toast.success("OTP resent to your email!");
        setOtpTimer(response.data.data.expiresIn || 600);
        setOtp(""); // Clear previous OTP
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== STEP 3: COMPLETE REGISTRATION ====================
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validPassword = passwordRegex.test(password);
    const passwordsMatch = password === confirmPassword;

    setIsPasswordValid(validPassword);

    if (!validPassword) {
      toast.error(
        "Password must be at least 8 characters with letters and numbers"
      );
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: password,
        otp: otp.trim(),
      });

      if (response.data.success) {
        toast.success("Registration successful! Welcome to Edifai! 🎉");

        // Store token and user data
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // Redirect to home or dashboard (or back to previous page)
        setTimeout(() => {
          navigate(from);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);

      // If OTP is invalid/expired, go back to step 2
      if (errorMessage.toLowerCase().includes("otp")) {
        toast.info("Please verify OTP again");
        setStep(2);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col xl:flex-row bg-white">
      {/* Left Section - Hero/Carousel */}
      <div className="w-full xl:w-[65%] 2xl:w-[70%] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 min-h-[50vh] xl:min-h-screen">
        {/* Tag */}
        <div className="flex justify-center xl:justify-start items-center h-14 sm:h-16 md:h-18 lg:h-20 px-3 sm:px-4 md:px-5 lg:px-6 bg-white rounded-full shadow-lg mb-4 sm:mb-6 md:mb-8 self-start">
          <img
            src={Star}
            alt="Star"
            className="w-3 sm:w-3.5 md:w-4 flex-shrink-0"
          />
          <div className="pl-2 sm:pl-2.5 md:pl-3 leading-tight">
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 font-mont whitespace-nowrap">
              Discover More, Learn <br />
              More - 500+ Courses <br />
              Inside
            </span>
          </div>
        </div>

        {/* Carousel Section */}
        <div className="relative flex justify-center items-center w-full flex-1">
          <div className="flex flex-col items-center relative w-full max-w-5xl">
            {/* Background Vector */}
            <img
              src={Vector}
              alt="Background"
              className="absolute z-0 w-[250px] sm:w-[320px] md:w-[420px] lg:w-[550px] xl:w-[650px] 2xl:w-[850px] opacity-70 pointer-events-none"
              style={{ top: "10%" }}
            />

            {/* Content */}
            <div className="relative z-10 text-center flex flex-col justify-center w-full px-4 sm:px-6 md:px-8 mt-24 sm:mt-32 md:mt-40 lg:mt-48 xl:mt-56">
              {/* Badge */}
              <div className="flex justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="flex justify-center items-center bg-[#8A63FF] text-white text-[10px] sm:text-xs md:text-sm px-3 sm:px-4 md:px-5 lg:px-6 py-1 sm:py-1.5 rounded-full font-medium font-mont">
                  SUPERVISED COURSES
                </div>
              </div>

              {/* Carousel Content */}
              <div className="overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] xl:min-h-[220px] flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <div key={currentSlide} className="w-full">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight font-mont animate-pop-slide px-4">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-relaxed font-mont max-w-2xl mx-auto animate-pop-slide px-4">
                    {slides[currentSlide].description}
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-7 md:mb-8 lg:mb-10 xl:mb-12">
                <Button
                  style={{
                    backgroundColor: "#8A63FF",
                    boxShadow: "0px 8px 16px 0px rgba(0, 0, 0, 0.15)",
                  }}
                  className="text-white rounded-md px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-mont w-full sm:w-auto"
                >
                  Start learning Now
                </Button>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <img
                        key={i}
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-white"
                        src={`https://i.pravatar.cc/32?img=${i}`}
                        alt={`Student ${i}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-mont whitespace-nowrap">
                    1k+ students
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex justify-center">
                <div className="w-40 sm:w-48 md:w-56 lg:w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-transform duration-500 ease-in-out"
                    style={{
                      width: `${100 / slides.length}%`,
                      transform: `translateX(${currentSlide * 100}%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full xl:w-[35%] 2xl:w-[30%] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-8 2xl:p-12 bg-gray-50 xl:bg-white min-h-[50vh] xl:min-h-screen">
        <div className="w-full max-w-md xl:max-w-sm 2xl:max-w-md">
          {view === "login" ? (
            <Login />
          ) : (
            <SignupMultiStepForm
              step={step}
              setStep={setStep}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              otp={otp}
              setOtp={setOtp}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isEmailValid={isEmailValid}
              isPhoneValid={isPhoneValid}
              isPasswordValid={isPasswordValid}
              handleStep1Submit={handleStep1Submit}
              handleStep2Submit={handleStep2Submit}
              handleStep3Submit={handleStep3Submit}
              handleResendOTP={handleResendOTP}
              setView={setView}
              isLoading={isLoading}
              otpTimer={otpTimer}
              formatTimer={formatTimer}
            />
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes popSlide {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-pop-slide {
            animation: popSlide 0.5s ease-in-out forwards;
          }
        `}
      </style>
    </div>
  );
};

// Multi-Step Signup Form Component
interface SignupMultiStepFormProps {
  step: SignupStep;
  setStep: (step: SignupStep) => void;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  isEmailValid: boolean;
  isPhoneValid: boolean;
  isPasswordValid: boolean;
  handleStep1Submit: (e: React.FormEvent) => void;
  handleStep2Submit: (e: React.FormEvent) => void;
  handleStep3Submit: (e: React.FormEvent) => void;
  handleResendOTP: () => void;
  setView: React.Dispatch<React.SetStateAction<"signup" | "login">>;
  isLoading: boolean;
  otpTimer: number;
  formatTimer: (seconds: number) => string;
}

const SignupMultiStepForm: React.FC<SignupMultiStepFormProps> = ({
  step,
  setStep,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  otp,
  setOtp,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  isEmailValid,
  isPhoneValid,
  isPasswordValid,
  handleStep1Submit,
  handleStep2Submit,
  handleStep3Submit,
  handleResendOTP,
  setView,
  isLoading,
  otpTimer,
  formatTimer,
}) => {
  return (
    <div className="w-full bg-white rounded-xl xl:rounded-none p-4 sm:p-6 md:p-8 xl:p-0 shadow-lg xl:shadow-none">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 font-mont">
          {step === 1 && "Hey There! 👋"}
          {step === 2 && "Verify Your Email 📧"}
          {step === 3 && "Set Your Password 🔒"}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-mont">
          {step === 1 && "Sign Up Now—Discover 500+ Books"}
          {step === 2 && "Enter the OTP sent to your email"}
          {step === 3 && "Create a strong password"}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 md:mb-7 lg:mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                s === step
                  ? "bg-[#8A63FF] text-white scale-110"
                  : s < step
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s < step ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-colors ${
                  s < step ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Email & Phone */}
      {step === 1 && (
        <form
          onSubmit={handleStep1Submit}
          className="space-y-3 sm:space-y-4 md:space-y-5"
        >
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 font-mont">
              Full Name*
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 font-mont">
              Email Address*
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="email"
                placeholder="john@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className={`h-10 sm:h-11 md:h-12 pl-9 sm:pl-10 pr-3 sm:pr-4 rounded-lg border ${
                  isEmailValid ? "border-gray-300" : "border-red-500"
                } focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs sm:text-sm`}
              />
            </div>
            {!isEmailValid && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-mont">
                Please enter a valid email address
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 font-mont">
              Phone Number*
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                required
                disabled={isLoading}
                className={`h-10 sm:h-11 md:h-12 pl-9 sm:pl-10 pr-3 sm:pr-4 rounded-lg border ${
                  isPhoneValid ? "border-gray-300" : "border-red-500"
                } focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs sm:text-sm`}
              />
            </div>
            {!isPhoneValid && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-mont">
                Please enter a valid 10-digit phone number
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 sm:h-11 md:h-12 bg-[#8A63FF] hover:bg-[#7A53EF] text-white rounded-lg text-xs sm:text-sm font-mont font-semibold mt-4 sm:mt-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Continue to OTP Verification"
            )}
          </Button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form
          onSubmit={handleStep2Submit}
          className="space-y-3 sm:space-y-4 md:space-y-5"
        >
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-700 font-mont">
              We've sent a 6-digit OTP to{" "}
              <strong className="break-all">{email}</strong>
            </p>
            {otpTimer > 0 && (
              <p className="text-xs text-purple-600 font-mont mt-2">
                ⏰ Expires in: <strong>{formatTimer(otpTimer)}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 font-mont">
              Enter OTP*
            </label>
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
              disabled={isLoading}
              autoFocus
              className="h-12 sm:h-14 md:h-16 px-3 sm:px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-lg sm:text-xl md:text-2xl tracking-widest font-mono"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={otpTimer > 0 || isLoading}
              className={`text-xs sm:text-sm font-mont font-medium ${
                otpTimer > 0 || isLoading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#8A63FF] hover:underline"
              }`}
            >
              {otpTimer > 0
                ? `Resend in ${formatTimer(otpTimer)}`
                : "Resend OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-mont flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Change Email
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full h-10 sm:h-11 md:h-12 bg-[#8A63FF] hover:bg-[#7A53EF] text-white rounded-lg text-xs sm:text-sm font-mont font-semibold mt-4 sm:mt-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </form>
      )}

      {/* Step 3: Password Setup */}
      {step === 3 && (
        <form
          onSubmit={handleStep3Submit}
          className="space-y-3 sm:space-y-4 md:space-y-5"
        >
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 font-mont">
              Password*
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={`h-10 sm:h-11 md:h-12 pl-9 sm:pl-10 pr-9 sm:pr-10 rounded-lg border ${
                  isPasswordValid ? "border-gray-300" : "border-red-500"
                } focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs sm:text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            {!isPasswordValid && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-mont">
                Password must be at least 8 characters with letters and numbers
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 font-mont">
              Confirm Password*
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className={`h-10 sm:h-11 md:h-12 pl-9 sm:pl-10 pr-9 sm:pr-10 rounded-lg border ${
                  password === confirmPassword
                    ? "border-gray-300"
                    : "border-red-500"
                } focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs sm:text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            {password !== confirmPassword && confirmPassword && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-mont">
                Passwords do not match
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-gray-700 font-mont leading-relaxed">
              ✓ At least 8 characters
              <br />✓ Contains letters and numbers
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 sm:h-11 md:h-12 bg-[#8A63FF] hover:bg-[#7A53EF] text-white rounded-lg text-xs sm:text-sm font-mont font-semibold mt-4 sm:mt-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Complete Signup"
            )}
          </Button>
        </form>
      )}

      {/* Footer - Login Link */}
      <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 text-center">
        <p className="text-xs sm:text-sm text-gray-600 font-mont">
          Already have an account?{" "}
          <button
            onClick={() => setView("login")}
            className="text-[#8A63FF] font-semibold hover:underline"
            disabled={isLoading}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;

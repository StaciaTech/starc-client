import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { LoginSocialGoogle } from "reactjs-social-login";
import Vector from "../Assets/Vector-3.png";
import Star from "../Assets/star.png";
import ForgotPassword from "../components/ForgotPassword";
import authService from "@/services/authService";
import { toast } from "sonner";
import { useAuth } from "@/App";

interface Slide {
  title: string;
  description: string;
}

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isEmailValid: boolean;
  setIsEmailValid: (value: boolean) => void;
  isPasswordValid: boolean;
  setIsPasswordValid: (value: boolean) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  setView: (view: "login" | "forgot") => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  isEmailValid,
  setIsEmailValid,
  isPasswordValid,
  setIsPasswordValid,
  showPassword,
  setShowPassword,
  handleLogin,
  setView,
  isLoading
}) => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-6 py-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#8A63FF]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-mont">
            Welcome Back! 👋
          </h2>
          <p className="text-gray-600 text-sm font-mont">
            Sign in to continue your learning journey
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 font-mont">
                  Email address
                </label>
                {!isEmailValid && (
                  <span className="text-red-500 text-xs font-mont">
                    Invalid email
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  className={`pl-10 h-12 rounded-xl border ${
                    isEmailValid ? "border-gray-200 focus:border-[#8A63FF]" : "border-red-300"
                  } focus:ring-[#8A63FF] text-sm w-full`}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 font-mont">
                  Password
                </label>
                {!isPasswordValid && (
                  <span className="text-red-500 text-xs font-mont">
                    Invalid password
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  className={`pl-10 h-12 rounded-xl border ${
                    isPasswordValid ? "border-gray-200 focus:border-[#8A63FF]" : "border-red-300"
                  } focus:ring-[#8A63FF] text-sm w-full pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-xs text-[#8A63FF] font-medium font-mont hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-[#8A63FF] to-[#6E51E0] hover:from-[#7A53EF] hover:to-[#5E41D0] text-white rounded-xl text-base font-mont font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="relative flex items-center justify-center my-6">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="flex-shrink-0 px-4 text-gray-400 text-xs font-mont">or continue with</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          <div className="flex gap-4">
            <Link to="/" className="w-full">
              <Button
                variant="outline"
                className="w-full h-12 border border-gray-200 text-gray-700 rounded-xl text-sm font-mont font-medium hover:bg-gray-50 transition-colors"
                type="button"
              >
                Continue to Home
              </Button>
            </Link>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm font-mont">
            Don't have an account?{" "}
            <Link to="/signup">
              <span className="text-[#8A63FF] font-semibold hover:underline cursor-pointer">
                Sign up
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const [view, setView] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    const validEmail: boolean = emailRegex.test(email);
    const validPassword: boolean = passwordRegex.test(password);

    setIsEmailValid(validEmail);
    setIsPasswordValid(validPassword);

    if (validEmail && validPassword) {
      try {
        setIsLoading(true);
        
        // Log the credentials being used
        console.log("Attempting login with:", { email, password });
        
        const response = await authService.login({ email, password });
        
        console.log("Login response:", response);
        
        // Update authentication state after successful login
        checkAuthStatus();
        
        // The login was successful if we got here without an exception
        toast.success("Login successful!");
        
        // Add a small delay before navigation to ensure state updates
        setTimeout(() => {
          navigate("/");
        }, 100);
      } catch (error: any) {
        console.error("Login error:", error);
        
        // Display more specific error messages based on the error
        if (error.response && error.response.status === 401) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (view === "forgot") {
    return <ForgotPassword />;
  }

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      isEmailValid={isEmailValid}
      setIsEmailValid={setIsEmailValid}
      isPasswordValid={isPasswordValid}
      setIsPasswordValid={setIsPasswordValid}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      handleLogin={handleLogin}
      setView={setView}
      isLoading={isLoading}
    />
  );
};

const Signup: React.FC = () => {
  const slides: Slide[] = [
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

  return (
    <div className="w-full h-screen flex">
      {/* Left side - Animated content */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgeT0iMSIgcj0iMSIgZmlsbD0iIzhBNjNGRjMzIi8+PC9zdmc+')] bg-repeat opacity-40"></div>
        
        <div className="absolute top-8 left-8">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md">
            <img src={Star} alt="Star" className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium text-gray-700 font-mont">
              Edifai
            </span>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full h-full px-12">
          <img
            src={Vector}
            alt="Background shape"
            className="absolute z-0 w-[120%] max-w-none opacity-20"
          />
          
          <div className="relative z-10 text-center max-w-md">
            <div className="inline-block mb-6 px-4 py-1 bg-[#8A63FF] text-white text-xs font-medium rounded-full">
              SUPERVISED COURSES
            </div>
            
            <div className="h-48 mb-8 flex items-center justify-center">
              <div key={currentSlide} className="animate-pop-slide">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 font-mont">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-gray-600 font-mont">
                  {slides[currentSlide].description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <Button
                style={{
                  backgroundColor: "#8A63FF",
                }}
                className="px-6 py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-mont"
              >
                Start Learning Now
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white"
                      src={`https://i.pravatar.cc/32?img=${i}`}
                      alt={`Student ${i}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-mont">1k+ students</span>
              </div>
              
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8A63FF] rounded-full"
                  style={{
                    width: `${100 / slides.length}%`,
                    transform: `translateX(${currentSlide * 100}%)`,
                    transition: skipTransition
                      ? "none"
                      : "transform 0.5s ease-in-out",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2">
        <Login />
      </div>
    </div>
  );
};

const LoginPage = () => {
  return <Signup />;
};

export default LoginPage;

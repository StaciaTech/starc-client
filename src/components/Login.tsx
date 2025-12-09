//Login
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { LoginSocialGoogle } from "reactjs-social-login";
import ForgotPassword from "./ForgotPassword";
import authService from "@/services/authService";
import { toast } from "sonner";

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
  isLoading?: boolean;
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
  isLoading = false,
}) => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-xs">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mont">
          Welcome Back 👋
        </h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <p className="text-sm text-gray-600 mb-2 pb-6 font-mont">
              Sign Up Now—Discover 500+ Courses are
              <br /> waiting for your Learning
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-mont">
              Email address/Phone Number*
            </label>
            <Input
              type="text"
              placeholder="john@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-10 px-3 rounded-lg border ${
                isEmailValid ? "border-gray-300" : "border-red-500"
              } focus:ring-purple-500 focus:border-purple-500 text-sm`}
            />
            {!isEmailValid && (
              <p className="text-red-500 text-xs mt-1 font-mont">
                Please enter a valid email address
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-mont">
              Password*
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-10 px-3 rounded-lg border ${
                  isPasswordValid ? "border-gray-300" : "border-red-500"
                } focus:ring-purple-500 focus:border-purple-500 pr-10 text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {!isPasswordValid && (
              <p className="text-red-500 text-xs mt-1 font-mont">
                Password must be at least 8 characters with a letter and a
                number
              </p>
            )}
            <div className="text-right mt-1">
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-xs text-black font-medium font-mont underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            style={{ backgroundColor: "#8A63FF" }}
            className="w-full h-10 text-white rounded-lg text-sm font-mont font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <div className="flex items-center justify-center my-2">
            <div className="flex-1 h-px bg-gray-200 max-w-[140px]"></div>
            <span className="text-gray-300 text-xs mx-1.5 font-mont">Or</span>
            <div className="flex-1 h-px bg-gray-200 max-w-[140px]"></div>
          </div>

          <div className="flex space-x-2">
            <LoginSocialGoogle
              client_id={
                import.meta.env.VITE_GOOGLE_CLIENT_ID ||
                "897120726098-hjj58tfkldj1j9rhvh0nmed98hb16hbo.apps.googleusercontent.com"
              }
              access_type="offline"
              onResolve={({ provider, data }) => {
                console.log(provider, data);
              }}
              onReject={(err) => {
                console.log(err);
              }}
            >
              <Button
                variant="outline"
                className="w-22 h-10 border border-gray-300 text-gray-700 rounded-sm text-xs font-semibold font-mont flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.31 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </LoginSocialGoogle>
            <Link to="/">
              <Button
                variant="outline"
                className="w-30 h-10 border border-gray-300 text-gray-700 rounded-sm text-xs font-semibold font-mont"
              >
                Continue as Guest
              </Button>
            </Link>
          </div>
        </form>
        {/* <div className="mt-8 text-left">
          <p className="text-black text-sm font-bold font-mont pt-3">
            Don’t have an account?{" "}
            <span className="text-black underline font-bold cursor-pointer">
              Sign up
            </span>
          </p>
        </div> */}
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const [view, setView] = useState<"login" | "forgot">("login");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Relaxed password regex for login to avoid blocking users with old passwords
  const passwordRegex: RegExp = /^.{6,}$/;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validEmail: boolean = emailRegex.test(email);
    const validPassword: boolean = passwordRegex.test(password);

    setIsEmailValid(validEmail);
    setIsPasswordValid(validPassword);

    if (validEmail && validPassword) {
      try {
        setIsLoading(true);
        const response = await authService.login({ email, password });

        if (response.token) {
          toast.success("Login successful!");
          // authService.login already sets localStorage and dispatches event
          navigate(from);
        }
      } catch (error: any) {
        console.error("Login Error:", error);
        toast.error(error.message || "Invalid email or password");
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

export default Login;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginSocialGoogle } from "reactjs-social-login";
import { forgotPassword, verifyOtp, resetPassword } from "../services/authService";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  // Steps: "email" | "otp" | "password" | "success"
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">("email");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Validation / UI states
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const valid = emailRegex.test(email);
    setIsEmailValid(valid);

    if (!valid) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setStep("otp");
      setResendTimer(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err || "Failed to send verification code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setStep("password");
    } catch (err: any) {
      setError(err || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setResendTimer(60);
    } catch (err: any) {
      setError(err || "Failed to resend verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, password });
      setStep("success");
    } catch (err: any) {
      setError(err || "Failed to reset password. Please restart the process.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 flex flex-col justify-center my-8">
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg font-mont">
            {error}
          </div>
        )}

        {step === "email" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-mont text-left">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600 mb-6 font-mont text-left leading-relaxed">
              Forgot it? No problem! Enter your registered email address below, and we'll send you a 6-digit verification code to reset it.
            </p>
            <form className="space-y-4" onSubmit={handleEmailSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5 font-mont text-left"
                >
                  Email address*
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@gmail.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`h-11 px-3.5 rounded-xl border ${
                    isEmailValid ? "border-gray-200" : "border-red-500"
                  } focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm w-full`}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#8A63FF" }}
                className="w-full h-11 text-white rounded-xl text-sm font-mont font-semibold hover:opacity-95 transition-opacity"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-xs font-mont">Or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="mt-6 flex space-x-2">
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
                  type="button"
                  className="h-10 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold font-mont flex items-center justify-center gap-1.5 px-4"
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
                  className="h-10 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold font-mont px-4"
                >
                  Continue as Guest
                </Button>
              </Link>
            </div>

            <div className="mt-8 text-center border-t border-gray-100 pt-5">
              <p className="text-gray-600 text-sm font-mont">
                Back to{" "}
                <Link to="/login" className="text-purple-600 hover:underline font-bold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-mont text-left">
              Verification Code
            </h2>
            <p className="text-sm text-gray-600 mb-6 font-mont text-left leading-relaxed">
              We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{email}</span>. Please enter it below.
            </p>
            <form className="space-y-4" onSubmit={handleOtpSubmit}>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1.5 font-mont text-left"
                >
                  Verification Code*
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setOtp(e.target.value.replace(/[^0-9]/g, ""));
                    if (error) setError("");
                  }}
                  className="h-11 px-3.5 tracking-[0.5em] text-center font-mono text-lg rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#8A63FF" }}
                className="w-full h-11 text-white rounded-xl text-sm font-mont font-semibold hover:opacity-95 transition-opacity"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                className={`text-sm font-mont font-bold ${
                  resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-purple-600 hover:underline"
                }`}
              >
                {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("email");
                }}
                className="text-sm font-mont font-bold text-gray-500 hover:text-gray-700 hover:underline"
              >
                Change Email Address
              </button>
            </div>
          </div>
        )}

        {step === "password" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-mont text-left">
              Reset Password
            </h2>
            <p className="text-sm text-gray-600 mb-6 font-mont text-left leading-relaxed">
              Create a new strong password for your account.
            </p>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5 font-mont text-left"
                >
                  New Password*
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="h-11 pl-3.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5 font-mont text-left"
                >
                  Confirm Password*
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="h-11 pl-3.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 font-mont text-left leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700 block mb-1">Password Requirements:</span>
                • Must be at least 8 characters long<br />
                • Must contain both letters and numbers
              </div>

              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#8A63FF" }}
                className="w-full h-11 text-white rounded-xl text-sm font-mont font-semibold hover:opacity-95 transition-opacity"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-green-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-mont">
              Reset Successful
            </h2>
            <p className="text-sm text-gray-600 mb-8 font-mont leading-relaxed max-w-[280px] mx-auto">
              Your password has been successfully reset. You can now use your new password to sign in.
            </p>
            <Button
              type="button"
              onClick={() => navigate("/login")}
              style={{ backgroundColor: "#8A63FF" }}
              className="w-full h-11 text-white rounded-xl text-sm font-mont font-semibold hover:opacity-95 transition-opacity"
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { ArrowRight, Mail, CheckCircle } from "lucide-react";
import check from "../Assets/check.gif";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../lib/api";

const PurpleBox: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async () => {
    // Clear any previous errors
    setError("");
    
    if (!email.trim()) {
      setError("Please enter your email address");
      toast.error("Please enter your email address");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Send subscription request to the backend
      const response = await api.post("/api/contact/subscribe", {
        email,
        name: "Subscriber", // Default name for subscribers
        subject: "Newsletter Subscription",
        message: "I would like to subscribe to the Edifai newsletter",
        recipientEmail: "contact@edifai.com"
      });
      
      if (response.data.success) {
        setIsSubmitted(true);
        setEmail("");
        toast.success("Thank you for subscribing! Check your inbox for a welcome email.", {
          autoClose: 5000
        });
        
        // Keep the success state for a better user experience
        setTimeout(() => {
          setIsSubmitted(false);
        }, 10000); // Keep success state for 10 seconds
      } else {
        setError("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setError("Failed to subscribe. Please try again later.");
      toast.error("Failed to subscribe. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && !isSubmitted && email) {
      handleSubmit();
    }
  };
  
  return (
    <section 
      className="py-6 sm:py-8 md:py-10 lg:py-14 text-white text-center relative overflow-hidden purple-box bg-[#8A63FF] rounded-xl sm:rounded-2xl md:rounded-3xl w-[94%] sm:w-[90%] md:w-[85%] lg:w-[75%] shadow-xl sm:shadow-2xl mx-auto my-4 sm:my-6"
    >
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <div className="w-[94%] sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%] mx-auto px-2 sm:px-4">
        {/* Heading and Subtext */}
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-mont font-medium mb-2 sm:mb-3 md:mb-4 leading-tight">
          Join ambitious professionals and unlock your dream career today
        </h2>
        <p className="text-xs sm:text-sm md:text-base mb-4 sm:mb-6 md:mb-8 leading-relaxed">
          Unlock your potential and discover opportunities that align with your skills and aspirations
        </p>

        {/* Input and Button */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4">
          {/* Email Input */}
          <div className={`flex items-center bg-white rounded-full px-3 sm:px-4 py-2 shadow-md w-full sm:w-auto sm:flex-1 max-w-[400px] ${error ? 'border-2 border-red-300' : ''}`}>
            <Mail className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 ${error ? 'text-red-500' : 'text-[#8A63FF]'}`} />
            <input
              type="email"
              placeholder="Your email address"
              className="bg-transparent outline-none text-black placeholder-gray-400 text-xs sm:text-sm md:text-base w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting || isSubmitted}
            />
          </div>

          {/* Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSubmitted || !email}
            className="bg-white text-[#8A63FF] font-mont font-semibold px-3 sm:px-4 md:px-6 py-2 mt-2 sm:mt-0 rounded-full shadow-md hover:bg-gray-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base w-full sm:w-auto disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse">Subscribing...</span>
              </>
            ) : isSubmitted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Subscribed
              </>
            ) : (
              <>
                Join Us
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 sm:mt-3 text-center">
            <span className="text-red-200 font-semibold text-xs sm:text-sm">{error}</span>
          </div>
        )}
        
        {/* Success message */}
        {isSubmitted && (
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3 inline-block">
            <p className="text-white text-sm">
              Thank you for subscribing! Check your inbox for a welcome email.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PurpleBox;

import React from "react";
import { useNavigate } from "react-router-dom";
import { BellOff, ArrowLeft, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-mont">
      <Navbar />

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 sm:py-24 max-w-lg mx-auto w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="self-start mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-[#8A63FF] transition-colors group font-semibold"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go Back</span>
        </button>

        {/* Main Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center flex flex-col items-center relative overflow-hidden group">
          {/* Glassmorphic decorative background circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-60 group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full blur-2xl opacity-60 group-hover:scale-125 transition-transform duration-700" />

          {/* Premium Illustration */}
          <div className="relative mb-8 w-48 h-48 flex items-center justify-center">
            {/* Glimmer/Pulse Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8A63FF]/10 to-indigo-500/10 animate-ping opacity-75" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#8A63FF]/5 to-indigo-500/5 animate-pulse" />

            {/* Main Circle Backplate */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-[#8A63FF]/20 to-indigo-500/5 flex items-center justify-center shadow-inner relative z-10">

              {/* Animated Floating Bell Off */}
              <div className="relative transform hover:scale-110 hover:rotate-6 transition-all duration-300">
                {/* 3D Drop Shadow Bell */}
                <BellOff className="w-16 h-16 text-[#8A63FF] stroke-[1.5]" />

                {/* Decorative mini stars */}
                <div className="absolute -top-1 -right-2 w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-100" />
                <div className="absolute -bottom-2 -left-1 w-2.5 h-2.5 bg-[#8A63FF] rounded-full animate-ping" />
              </div>
            </div>
          </div>

          {/* Heading & Text */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            All caught up!
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
            You don't have any notifications right now. We'll let you know when your courses are ready, assignments are graded, or when your study groups have updates.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={() => navigate("/course")}
              className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-bold py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#8A63FF]/20 hover:shadow-xl hover:shadow-[#8A63FF]/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Courses</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3.5 px-6 rounded-full transition-all border border-gray-200 hover:border-gray-300 text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Go to Profile</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;

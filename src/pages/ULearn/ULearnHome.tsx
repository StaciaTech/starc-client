import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpen, Zap, Flame, Trophy, ChevronRight, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getStats, getMyCourses, type ULearnStats } from "@/services/ulearnService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const EXAMPLE_TOPICS = [
  "Machine Learning", "Python for Beginners", "Web3 & Blockchain",
  "UI/UX Design", "Cloud Computing with AWS", "Data Structures & Algorithms",
];

const ULearnHome = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [stats, setStats] = useState<ULearnStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, courses] = await Promise.all([getStats(), getMyCourses()]);
        setStats(s);
        setRecentCourses(courses.slice(0, 3));
      } catch {
        // first time user — stats will be null until they start
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  const handleStart = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first!");
      return;
    }
    navigate("/learn/diagnostic", { state: { topic: topic.trim() } });
  };

  const totalChapters = (course: any) =>
    course.modules?.reduce((acc: number, m: any) => acc + (m.chapters?.length || 0), 0) || 0;

  const completedChapters = (course: any) => course.completedChapterIds?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c1d] via-[#1a1040] to-[#0f0c1d]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#8A63FF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#8A63FF]/10 border border-[#8A63FF]/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#8A63FF]" />
            <span className="text-[#8A63FF] text-sm font-medium">AI-Powered Personalised Learning</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            What do you want to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A63FF] to-[#c084fc]">
              learn today?
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Tell us your topic. Our AI tests your current knowledge and builds a personalised course just for you.
          </p>

          {/* Topic Input */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder="e.g. Machine Learning, React, Blockchain..."
              className="flex-1 bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-[#8A63FF] focus:ring-2 focus:ring-[#8A63FF]/30 transition-all"
              autoFocus
            />
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-[#8A63FF] to-[#7c3aed] text-white font-semibold px-8 py-4 rounded-2xl flex items-center gap-2 hover:opacity-90 hover:shadow-lg hover:shadow-[#8A63FF]/30 transition-all active:scale-95"
            >
              Start Learning <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Example Topics */}
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className="bg-white/5 hover:bg-[#8A63FF]/20 border border-white/10 hover:border-[#8A63FF]/50 text-gray-300 hover:text-white text-sm px-4 py-1.5 rounded-full transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {!loadingStats && (
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: "Level", value: stats?.level ?? 1, bg: "from-yellow-500/10 to-orange-500/10", border: "border-yellow-500/20" },
              { icon: <Zap className="w-5 h-5 text-[#8A63FF]" />, label: "XP", value: `${stats?.xp ?? 0}`, bg: "from-purple-500/10 to-violet-500/10", border: "border-purple-500/20" },
              { icon: <Flame className="w-5 h-5 text-orange-400" />, label: "Streak", value: `${stats?.streak ?? 0} days`, bg: "from-orange-500/10 to-red-500/10", border: "border-orange-500/20" },
              { icon: <BookOpen className="w-5 h-5 text-emerald-400" />, label: "Quiz Credits", value: stats?.quizCredits ?? 5, bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/20" },
            ].map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-4 flex items-center gap-3`}>
                <div className="shrink-0">{s.icon}</div>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-white font-bold text-lg">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-xl">Continue Learning</h2>
            <button onClick={() => navigate("/learn/my-courses")} className="text-[#8A63FF] text-sm flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {recentCourses.map((course) => {
              const total = totalChapters(course);
              const done = completedChapters(course);
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div
                  key={course._id}
                  onClick={() => navigate(`/learn/course/${course._id}`)}
                  className="bg-white/5 border border-white/10 hover:border-[#8A63FF]/50 rounded-2xl p-5 cursor-pointer group transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs text-[#8A63FF] bg-[#8A63FF]/10 px-2 py-1 rounded-full capitalize">{course.skillLevel}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#8A63FF] transition-colors" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-3 line-clamp-2">{course.title}</h3>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                    <div className="bg-gradient-to-r from-[#8A63FF] to-[#c084fc] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-gray-400 text-xs">{done}/{total} chapters · {pct}%</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-white font-bold text-xl text-center mb-8">How AI Learning Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Short Diagnostic", desc: "4 quick questions to assess your current knowledge level on the topic." },
            { step: "02", title: "AI Builds Your Course", desc: "A personalised curriculum is generated in minutes — skipping what you already know." },
            { step: "03", title: "Learn, Test, Progress", desc: "Read chapters, take quizzes, ask your AI tutor, and unlock next chapters as you pass." },
          ].map((s) => (
            <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <span className="text-5xl font-black text-[#8A63FF]/20">{s.step}</span>
              <h3 className="text-white font-semibold mt-2 mb-1">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ULearnHome;

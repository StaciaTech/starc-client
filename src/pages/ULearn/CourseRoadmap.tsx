import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen, Lock, CheckCircle, ChevronRight, Zap,
  ChevronDown, Flame, Star, Brain, ClipboardList, ShieldCheck, ShieldOff,
  MessageCircle, X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCourse, getChatHistory, type ULearnCourse, type ULearnModule, type ULearnChapter, type ChatHistory } from "@/services/ulearnService";
import { useCourseStats } from "@/hooks/useBooks";
import { toast } from "sonner";

const CourseRoadmap = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<ULearnCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [strictMode, setStrictMode] = useState(
    () => localStorage.getItem(`strict_${courseId}`) === "true"
  );
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<ChatHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const openHistory = async () => {
    setHistoryOpen(true);
    if (!courseId) return;
    try {
      setHistoryLoading(true);
      const data = await getChatHistory(courseId);
      setHistoryData(data);
    } catch {
      toast.error("Could not load chat history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const { data: stats, isLoading: statsLoading } = useCourseStats(courseId);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId)
      .then(setCourse)
      .finally(() => setLoading(false));
  }, [courseId]);

  const toggleStrict = () => {
    const next = !strictMode;
    setStrictMode(next);
    localStorage.setItem(`strict_${courseId}`, String(next));
  };

  const toggleModule = (idx: number) =>
    setOpenModules((p) => {
      const n = new Set(p);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });

  const totalChapters = course?.modules?.reduce((a, m) => a + m.chapters.length, 0) || 0;
  const completedCount = course?.completedChapterIds?.length || 0;
  const pct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  // ── Loading ──────────────────────────────────────────
  if (loading || statsLoading) return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8A63FF]" />
      </div>
    </div>
  );

  // ── Course not found ─────────────────────────────────
  if (!course) return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400 text-sm">Course not found.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left Column ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h1>

            {/* ── Stats Bar + Strict Toggle ───────────────── */}
            <div className="bg-white rounded-[20px] shadow-md p-4 mb-5">
              <div className="flex flex-wrap items-center gap-3">

                {/* XP */}
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
                  <Star className="w-4 h-4 text-[#8A63FF] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 leading-none mb-0.5">XP</p>
                    <p className="text-sm font-bold text-gray-900">{stats?.xp ?? 0}</p>
                  </div>
                </div>

                {/* Level */}
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                  <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 leading-none mb-0.5">Level</p>
                    <p className="text-sm font-bold text-gray-900">{stats?.level ?? 1}</p>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                  <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 leading-none mb-0.5">Streak</p>
                    <p className="text-sm font-bold text-gray-900">{stats?.streak ?? 0}d</p>
                  </div>
                </div>

                {/* Quiz Credits */}
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  <ClipboardList className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 leading-none mb-0.5">Quizzes</p>
                    <p className="text-sm font-bold text-gray-900">{stats?.quizCredits ?? 0}</p>
                  </div>
                </div>

                {/* Question Credits */}
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                  <Brain className="w-4 h-4 text-green-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 leading-none mb-0.5">AI Questions</p>
                    <p className="text-sm font-bold text-gray-900">{stats?.questionCredits ?? 0}</p>
                  </div>
                </div>

                {/* AI Chat History */}
                <button
                  onClick={openHistory}
                  className="sm:ml-auto flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Chat History
                </button>

                {/* Strict Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleStrict}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${strictMode
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    {strictMode
                      ? <><ShieldCheck className="w-3.5 h-3.5" /> Strict ON</>
                      : <><ShieldOff className="w-3.5 h-3.5" /> Strict OFF</>
                    }
                  </button>
                  {strictMode && (
                    <span className="text-xs text-red-400 hidden sm:inline">
                      Must pass quiz to proceed
                    </span>
                  )}
                </div>
                <div><button
                  onClick={() => navigate(`/learn/group-study/${course._id}/leaderboard`)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all bg-gray-50 border-gray-200 text-gray-500 hover:bg-green-100`}
                >Group Leaderboard</button></div>
              </div>
            </div>

            {/* ── Module Tree ─────────────────────────────── */}
            {course.modules.map((mod: ULearnModule, mIdx) => (
              <div key={mod._id || mIdx} className="bg-white rounded-[20px] shadow-md overflow-hidden">

                {/* Module Header */}
                <button
                  onClick={() => toggleModule(mIdx)}
                  className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-[#8A63FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Module {mIdx + 1}</p>
                    <p className="text-gray-900 font-semibold truncate">{mod.title}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openModules.has(mIdx) ? "rotate-180" : ""}`} />
                </button>

                {/* Chapter List */}
                {openModules.has(mIdx) && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {mod.chapters.map((ch: ULearnChapter, cIdx) => {
                      const completed = course.completedChapterIds?.includes(ch._id);
                      const current = course.currentChapterId === ch._id;
                      const unlocked = strictMode ? ch.isUnlocked : true;

                      return (
                        <button
                          key={ch._id || cIdx}
                          disabled={!unlocked}
                          onClick={() => navigate(
                            `/learn/course/${courseId}/chapter/${ch._id}`,
                            { state: { moduleIdx: mIdx, chapterIdx: cIdx, strictMode, quizCredits: stats?.quizCredits, questionCredits: stats?.questionCredits } }
                          )}
                          className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors
                            ${current ? "bg-purple-50" : ""}
                            ${unlocked ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 cursor-not-allowed"}
                          `}
                        >
                          {/* Status Icon */}
                          <div className="shrink-0">
                            {completed ? (
                              <CheckCircle className="w-5 h-5 text-[#8A63FF]" />
                            ) : current ? (
                              <div className="w-5 h-5 rounded-full border-2 border-[#8A63FF] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#8A63FF]" />
                              </div>
                            ) : !unlocked ? (
                              <Lock className="w-5 h-5 text-gray-300" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>

                          {/* Title + Summary */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${current ? "text-[#8A63FF]" : "text-gray-800"}`}>
                              {cIdx + 1}. {ch.title}
                            </p>
                            {ch.summary && (
                              <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{ch.summary}</p>
                            )}
                          </div>

                          {/* XP Badge */}
                          <span className="text-xs text-[#8A63FF] font-semibold shrink-0 flex items-center gap-1">
                            <Zap className="w-3 h-3" />{ch.xpReward}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Right Info Panel ─────────────────────────── */}
          <div className="space-y-4">

            {/* Progress */}
            <div className="bg-white rounded-[20px] shadow-md p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">Your Progress</h3>
                <span className="text-[#8A63FF] font-bold">{pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-[#8A63FF] h-2.5 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm">{completedCount} of {totalChapters} chapters done</p>
            </div>

            {/* About */}
            <div className="bg-white rounded-[20px] shadow-md p-5">
              <h3 className="font-semibold text-gray-900 mb-3">About this Course</h3>
              <p className="text-gray-500 text-sm mb-4">{course.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Level", value: course.skillLevel },
                  { label: "Duration", value: `~${course.estimatedHours}h` },
                  { label: "Modules", value: String(course.modules.length) },
                  { label: "Chapters", value: String(totalChapters) },
                ].map((info) => (
                  <div key={info.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-gray-400 text-xs capitalize">{info.label}</p>
                    <p className="text-gray-800 font-semibold text-sm mt-0.5 capitalize">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue CTA */}
            {course.currentChapterId && (
              <button
                onClick={() => {
                  const flat = course.modules.flatMap((m, mIdx) =>
                    m.chapters.map((c, cIdx) => ({ ...c, mIdx, cIdx }))
                  );
                  const cur = flat.find((c) => c._id === course.currentChapterId);
                  if (cur) navigate(
                    `/learn/course/${courseId}/chapter/${cur._id}`,
                    { state: { moduleIdx: cur.mIdx, chapterIdx: cur.cIdx, strictMode, quizCredits: stats?.quizCredits, questionCredits: stats?.questionCredits } }
                  );
                }}
                className="w-full bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {completedCount === 0 ? "Start Learning" : "Continue Learning"}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>
      </div>
      <Footer />

      {/* AI Chat History Drawer/Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setHistoryOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl font-mont">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#8A63FF]" /> Course AI Chat History
                </h3>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#8A63FF]" />
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">No chat history found for this course.</p>
                </div>
              ) : (
                historyData.map((ch) => (
                  <div key={ch._id} className="space-y-3">
                    <h4 className="font-semibold text-gray-800 text-sm border-b pb-1">
                      {ch.chapterTitle}
                    </h4>
                    {ch.chats.map((c, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm bg-[#8A63FF] text-white rounded-br-sm">
                            {c.question}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm bg-gray-100 text-gray-800 rounded-bl-sm whitespace-pre-wrap">
                            {c.answer}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRoadmap;

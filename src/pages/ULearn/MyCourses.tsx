import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Clock, ChevronRight, Loader2, Plus, Sparkles,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMyCourses, getMyGroups, GroupStudyCourse, type ULearnCourse } from "@/services/ulearnService";

const statusConfig: Record<string, { label: string; style: string }> = {
  pending: { label: "Queued", style: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  generating_structure: { label: "Building…", style: "text-blue-700 bg-blue-50 border-blue-200" },
  payment_pending: { label: "Payment Required", style: "text-orange-700 bg-orange-50 border-orange-200" },
  generating_content: { label: "Writing…", style: "text-[#8A63FF] bg-purple-50 border-purple-200" },
  completed: { label: "Ready", style: "text-green-700 bg-green-50 border-green-200" },
  failed: { label: "Failed", style: "text-red-700 bg-red-50 border-red-200" },
};

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ULearnCourse[]>([]);
  const [groups, setGroups] = useState<GroupStudyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyCourses(),
      getMyGroups().then(r => r.groups || []).catch(() => []),  // ✅ NEW
    ]).then(([c, g]) => {
      setCourses(c);
      setGroups(g);
    }).finally(() => setLoading(false));
  }, []);

  const totalChapters = (c: ULearnCourse) =>
    c.modules?.reduce((a, m) => a + (m.chapters?.length || 0), 0) || 0;

  const pct = (c: ULearnCourse) => {
    const t = totalChapters(c);
    return t > 0 ? Math.round(((c.completedChapterIds?.length || 0) / t) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your personalised AI-generated learning paths</p>
          </div>
          <button
            onClick={() => navigate("/course")}
            className="flex items-center gap-2 bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" /> New Course
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#8A63FF] animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Solo AI Courses ── */}
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8A63FF]" /> Solo Courses ({courses.length})
            </h2>
            {courses.length === 0 ? (
              <div className="bg-white rounded-[20px] p-8 text-center mb-6">
                <p className="text-gray-400 text-sm">No solo courses yet.</p>
                <button
                  onClick={() => navigate("/course")}
                  className="mt-3 bg-[#8A63FF] text-white px-6 py-2 rounded-full text-sm font-semibold"
                >Start Learning</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {courses.map((course) => {
                  const p = pct(course);
                  const total = totalChapters(course);
                  const done = course.completedChapterIds?.length || 0;
                  const cfg = statusConfig[course.generationStatus] || statusConfig.pending;
                  const isReady = course.generationStatus === "completed";
                  const isGenerating = ["pending", "generating_structure", "payment_pending", "generating_content"].includes(course.generationStatus);
                  return (
                    <div
                      key={course._id}
                      onClick={() => isReady
                        ? navigate(`/learn/course/${course._id}`)
                        : isGenerating && navigate(`/learn/generating/${course._id}`, { state: { topic: course.topic } })
                      }
                      className="bg-white rounded-[20px] shadow-md hover:shadow-lg cursor-pointer group transition-all border border-transparent hover:border-[#8A63FF]/20 p-5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs border px-2 py-0.5 rounded-full font-mont ${cfg.style}`}>{cfg.label}</span>
                        <span className="text-xs border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full capitalize font-mont">{course.skillLevel}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#8A63FF] transition-colors">{course.title}</h3>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-1">{course.description}</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                        <div className="bg-[#8A63FF] h-1.5 rounded-full" style={{ width: `${p}%` }} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{done}/{total} chapters · {p}%</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{course.estimatedHours}h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Group Courses ── */}
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8A63FF]" /> Group Courses ({groups.length})
            </h2>
            {groups.length === 0 ? (
              <div className="bg-white rounded-[20px] p-8 text-center">
                <p className="text-gray-400 text-sm">No group courses yet.</p>
                <button
                  onClick={() => navigate("/course")}
                  className="mt-3 bg-[#8A63FF] text-white px-6 py-2 rounded-full text-sm font-semibold"
                >Create Group</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map((group: any) => {
                  const myMember = group.myMember;
                  const statusStyle: Record<string, string> = {
                    open: "text-green-700 bg-green-50 border-green-200",
                    locked: "text-orange-700 bg-orange-50 border-orange-200",
                    active: "text-[#8A63FF] bg-purple-50 border-purple-200",
                    cancelled: "text-red-700 bg-red-50 border-red-200",
                  };
                  return (
                    <div
                      key={group._id}
                      onClick={() => navigate(`/learn/group-study/${group._id}`)}
                      className="bg-white rounded-[20px] shadow-md hover:shadow-lg cursor-pointer transition-all border border-transparent hover:border-[#8A63FF]/20 p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs border px-2 py-0.5 rounded-full font-semibold ${statusStyle[group.status]}`}>
                          {group.status.toUpperCase()}
                        </span>
                        {myMember?.paymentStatus === "pending" && myMember?.amountDue > 0 && (
                          <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                            💳 Pay ${myMember.amountDue}
                          </span>
                        )}
                        {myMember?.hasAccess && (
                          <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                            ✅ Access
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-0.5">{group.title}</h3>
                      <p className="text-xs text-gray-400 capitalize mb-3">{group.skillLevel} · {group.topic}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />{group.membersCount}/{group.groupSize} members
                        </span>
                        <span className="text-[#8A63FF] font-semibold">
                          {group.pricePerPerson > 0 ? `$${group.pricePerPerson}/person` : "Price TBD"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};


export default MyCourses;

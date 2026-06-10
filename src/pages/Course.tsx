import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PurpleBox from "@/components/PurpleBox";
import Footer from "@/components/Footer";
import WallOfLove from "../components/WallOfLove";
import { useNavigate, useLocation } from "react-router-dom";
import heroimage from "../Assets/Vector.png";
import Recard from "@/components/Card";
import courseService, { ICourse } from "@/services/courseService";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Lock, Sparkles, Trophy, Zap, Flame, BookOpen, Clock, ChevronRight, Plus, Search } from "lucide-react";
import { useAddToCart, useCart, useRemoveFromCart } from "../hooks/useCart";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "../hooks/useWishlist";
import { useEnrollments } from "@/hooks/useEnrollments";
import { toast } from "sonner";
import { useAuth } from "@/App";
import EntranceTestModal from "@/components/EntranceTestModal";
import { assessmentService } from "@/services/assessmentService";
import {
  getMyCourses,
  getMyGroups,
  createGroupStudy,
  type ULearnCourse,
  type GroupStudyCourse,
} from "@/services/ulearnService";
import { Users, Copy, Check, CalendarClock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";


interface Course {
  title: string;
  instructor: string;
  rating: number;
  students: number;
  price: number;
  originalPrice: number;
  duration: string;
  lessons: number;
  level: string;
  category: string;
  image: string;
  badge?: string;
  _id?: string;
  driveUrl?: string;
  type?: string;
  id?: string;
  createdAt?: string;
}

interface UserCourse {
  courseId: string;
  userId: string;
  progress?: number;
  completed?: boolean;
}

const Course: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"supervised" | "unsupervised">("supervised");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("Latest");
  const [statusFilter, setStatusFilter] = useState<string>("All Courses");

  const [uLearnTab, setULearnTab] = useState<"my-courses" | "group-study">("my-courses");
  const [myGroups, setMyGroups] = useState<GroupStudyCourse[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({
    title: "",
    topic: "",
    groupSize: 5,
    registrationDeadline: "",
    skillLevel: "mixed",
  });
  const [groupCreating, setGroupCreating] = useState(false);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);


  const [uLearnCourses, setULearnCourses] = useState<ULearnCourse[]>([]);

  const [uLearnLoading, setULearnLoading] = useState(false);
  const [uLearnLoaded, setULearnLoaded] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  const [userCourses] = useState<UserCourse[]>([
    { courseId: "1", userId: "user1" },
    { courseId: "2", userId: "user1" },
    { courseId: "3", userId: "user1", completed: true },
  ]);

  const starcBooks: any[] = [];

  const handleULearnTabSwitch = (tab: "my-courses" | "group-study") => {
    setULearnTab(tab);
    if (tab === "group-study" && !groupsLoaded) {
      setGroupsLoading(true);
      getMyGroups()
        .then((res) => setMyGroups(res.groups || []))
        .catch(() => { })
        .finally(() => { setGroupsLoading(false); setGroupsLoaded(true); });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.title || !groupForm.topic || !groupForm.registrationDeadline) {
      toast.error("Please fill all fields"); return;
    }
    setGroupCreating(true);
    try {
      const res = await createGroupStudy({ ...groupForm, diagnosticAnswers: [] });
      setMyGroups(prev => [res.group, ...prev]);
      toast.success("Group course created! AI is building your curriculum…");

      // ✅ Navigate to generating page — same as solo courses
      if (res.courseId) {
        navigate(`/learn/generating/${res.courseId}`, {
          state: {
            topic: groupForm.topic,
            isGroupStudy: true,
            inviteToken: res.group.inviteToken,
            groupId: res.group._id,
            groupSize: res.group.groupSize,
          },
        });
      }
    } catch {
      toast.error("Failed to create group course");
    } finally {
      setGroupCreating(false);
    }
  };


  const copyInviteLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedGroupId(id);
    toast.success("Invite link copied!");
    setTimeout(() => setCopiedGroupId(null), 2000);
  };

  const groupPrice = Math.ceil(groupForm.soloPrice * 1.3);
  const pricePerPerson = Math.ceil(groupPrice / groupForm.groupSize);


  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const courses = await courseService.getCourses(100);
        const formattedCourses: Course[] = courses.map((course: ICourse) => {
          // ✅ Original price is the base price
          console.log(course);

          const originalPrice = course.price;

          // ✅ Calculate discounted price if discount exists
          const discountedPrice =
            course.discount && course.discount > 0
              ? course.price - course.price * (course.discount / 100)
              : course.price;

          return {
            title: course.title,
            instructor: course.instructor?.name || "Unknown Instructor",
            rating: course.rating || 0,
            students: course.enrolledUsers?.length || 0,
            price: discountedPrice, // ✅ Discounted price
            originalPrice: originalPrice, // ✅ Original price (before discount)
            discount: course.discount || 0, // ✅ Add discount percentage
            duration: `${course.duration} hours`,
            lessons: course.lessons?.length || 0,
            level: course.level,
            category:
              course.category === "AI Generated"
                ? "Development"
                : course.category,
            image:
              course.thumbnail ||
              "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=300&h=200&fit=crop",
            badge: course.discount && course.discount > 0 ? "Sale" : undefined, // ✅ Only show Sale badge if discount exists
            _id: course._id,
            type: "course",
          };
        });
        setCoursesData(formattedCourses);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses");
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleModeToggle = (activeMode: "supervised" | "unsupervised") => {
    setMode(activeMode);
    // Load ULearn data lazily
    if (activeMode === "unsupervised" && !uLearnLoaded) {
      setULearnLoading(true);
      getMyCourses()
        .then((courses) => {
          setULearnCourses(courses);
        })
        .catch(() => { })
        .finally(() => {
          setULearnLoading(false);
          setULearnLoaded(true);
        });
    }
  };

  const applyFilters = (courses: Course[]) => {
    let filtered = courses;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) =>
        (c.category || "")
          .toLowerCase()
          .includes(selectedCategory.toLowerCase()),
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter !== "All Courses") {
      if (statusFilter === "In Progress") {
        filtered = filtered.filter((c) =>
          userCourses.find((uc) => uc.courseId === c._id && !uc.completed),
        );
      } else if (statusFilter === "Completed") {
        filtered = filtered.filter((c) =>
          userCourses.find((uc) => uc.courseId === c._id && uc.completed),
        );
      } else if (statusFilter === "Not Started") {
        filtered = filtered.filter(
          (c) => !userCourses.find((uc) => uc.courseId === c._id),
        );
      }
    }

    switch (sortOption) {
      case "Most Popular":
        filtered = filtered.slice().sort((a, b) => b.students - a.students);
        break;
      case "Highest Rated":
        filtered = filtered.slice().sort((a, b) => b.rating - a.rating);
        break;
      case "Newest":
        filtered = filtered
          .slice()
          .sort((a, b) => (b._id || "").localeCompare(a._id || ""));
        break;
      default:
        break;
    }

    return filtered;
  };

  const displayCourses =
    mode === "supervised" ? coursesData : (starcBooks as unknown as Course[]);
  const filteredCourses = applyFilters(displayCourses);
  console.log("here");

  console.log(filteredCourses);

  const categories = [
    "All Categories",
    "Design",
    "Development",
    "Mechanical",
    "IOT",
    "AI/ML",
    "Cloud",
    "Cybersecurity",
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const filterCards = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-white font-mont">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bottom-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col justify-center items-center">
            <img
              src={heroimage}
              alt="Hero Image"
              className="mx-auto"
              style={{
                width: "500px",
                height: "auto",
                position: "relative",
                left: "0",
                top: "90px",
                transform: "ScaleX(-1)",
              }}
            />
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
                Discover Our Edifai Courses
              </h1>
              <p className="text-[14px] text-gray-600 max-w-3xl mx-auto mb-8">
                Discover selected courses taught by expert instructors. Start
                learning today and advance your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <FilterSection
        initialActiveButton="supervised"
        description={
          mode === "supervised"
            ? "Scheduled live Google Meet classes with calendar/email alerts, seasonal batches, and fixed enrollment deadlines."
            : "Self-paced learning materials and PDF books you can download and study at your own pace."
        }
        onToggle={handleModeToggle}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Cards Section */}
      <div className="flex justify-center mb-20">
        {loading ? (
          <div className="flex relative justify-center py-8 mb-16 w-full px-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A63FF]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <section className="flex relative justify-center py-8 mb-16 w-full px-4 lg:px-6 flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
            {/* Sidebar */}
            <aside
              className="hidden lg:block lg:sticky h-[80vh] top-[90px] w-[200px] xl:w-[240px] flex-shrink-0 overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              <div className="w-full">
                <h2 className="text-xl xl:text-2xl font-mont font-bold mb-4 py-2 text-gray-800 text-center">
                  Categories
                </h2>
                <ul className="w-full overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((category, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setActiveIndex(index);
                        filterCards(
                          index === 0 ? "all" : category.toLowerCase(),
                        );
                      }}
                      className={`py-3 px-4 text-sm xl:text-base cursor-pointer w-full border-b-[0.1px] transition-colors ${index === activeIndex
                        ? "text-[#8A63FF] font-semibold bg-purple-50"
                        : "text-gray-800 hover:bg-gray-50"
                        }`}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-1 w-full max-w-[1300px]">
              {mode === "unsupervised" ? (
                <div className="w-full">
                  {uLearnLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A63FF] mb-4" />
                      <p className="text-gray-500 font-mont">Loading your AI courses…</p>
                    </div>
                  ) : (
                    <>
                      {/* ── Sub-tab Toggle ── */}
                      <div className="flex items-center gap-3 mb-6">
                        <button
                          onClick={() => handleULearnTabSwitch("my-courses")}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-mont transition-all ${uLearnTab === "my-courses"
                            ? "bg-[#8A63FF] text-white shadow-md"
                            : "bg-white border border-gray-200 text-gray-500 hover:border-[#8A63FF]/40"
                            }`}
                        >
                          <Sparkles className="w-4 h-4" /> My AI Courses
                        </button>
                        <button
                          onClick={() => handleULearnTabSwitch("group-study")}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-mont transition-all ${uLearnTab === "group-study"
                            ? "bg-[#8A63FF] text-white shadow-md"
                            : "bg-white border border-gray-200 text-gray-500 hover:border-[#8A63FF]/40"
                            }`}
                        >
                          <Users className="w-4 h-4" /> Group Study
                        </button>
                      </div>

                      {/* ══════════════════════════════════════════
            MY AI COURSES TAB
        ══════════════════════════════════════════ */}
                      {uLearnTab === "my-courses" && (
                        <>
                          {/* Topic Input */}
                          <div className="bg-white border border-purple-100 rounded-2xl p-6 mb-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-[#8A63FF]/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-[#8A63FF]" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 font-mont">Start a New AI Course</h3>
                                <p className="text-sm text-gray-400 font-mont">Our AI tests your level and builds a personalised curriculum for you.</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={newTopic}
                                  onChange={(e) => setNewTopic(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && newTopic.trim())
                                      navigate("/learn/diagnostic", { state: { topic: newTopic.trim() } });
                                  }}
                                  placeholder="What do you want to learn? e.g. Machine Learning, AWS…"
                                  className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8A63FF] focus:border-transparent font-mont text-sm"
                                />
                              </div>
                              <Button
                                onClick={() => newTopic.trim() && navigate("/learn/diagnostic", { state: { topic: newTopic.trim() } })}
                                className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white rounded-full px-6 font-mont font-semibold flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" /> Create Course
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {["Machine Learning", "Python", "React", "AWS", "Data Structures", "Web3"].map((t) => (
                                <button
                                  key={t}
                                  onClick={() => navigate("/learn/diagnostic", { state: { topic: t } })}
                                  className="text-xs bg-gray-100 hover:bg-[#8A63FF]/10 hover:text-[#8A63FF] hover:border-[#8A63FF]/30 border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full transition-all font-mont"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AI Course Cards */}
                          {uLearnCourses.length === 0 ? (
                            <div className="w-full text-center py-16 bg-white rounded-2xl border border-dashed border-purple-200">
                              <Sparkles className="w-12 h-12 text-[#8A63FF]/40 mx-auto mb-3" />
                              <h3 className="text-xl font-semibold text-gray-700 mb-2 font-mont">No AI courses yet</h3>
                              <p className="text-gray-400 text-sm font-mont">Enter a topic above to generate your first personalised course.</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800 font-mont">My AI Courses ({uLearnCourses.length})</h2>
                                <button onClick={() => navigate("/learn/my-courses")} className="text-[#8A63FF] text-sm font-medium flex items-center gap-1 hover:underline font-mont">
                                  View All <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                                {uLearnCourses.map((course) => {
                                  const total = course.modules?.reduce((a, m) => a + (m.chapters?.length || 0), 0) || 0;
                                  const done = course.completedChapterIds?.length || 0;
                                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                                  const isReady = course.generationStatus === "completed";
                                  const isGenerating = ["pending", "generating_structure", "payment_pending", "generating_content"].includes(course.generationStatus);
                                  const uLearnStatusConfig: Record<string, { label: string; style: string }> = {
                                    pending: { label: "Queued", style: "text-yellow-700 bg-yellow-50 border-yellow-200" },
                                    generating_structure: { label: "Building…", style: "text-blue-700 bg-blue-50 border-blue-200" },
                                    payment_pending: { label: "Payment Required", style: "text-orange-700 bg-orange-50 border-orange-200" },
                                    generating_content: { label: "Writing…", style: "text-[#8A63FF] bg-purple-50 border-purple-200" },
                                    completed: { label: "Ready", style: "text-green-700 bg-green-50 border-green-200" },
                                    failed: { label: "Failed", style: "text-red-700 bg-red-50 border-red-200" },
                                  };
                                  return (
                                    <div
                                      key={course._id}
                                      onClick={() => isReady
                                        ? navigate(`/learn/course/${course._id}`)
                                        : isGenerating && navigate(`/learn/generating/${course._id}`, { state: { topic: course.topic } })
                                      }
                                      className="w-full bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg hover:border-[#8A63FF]/30 cursor-pointer group transition-all duration-200 p-5"
                                    >
                                      <div className="w-full h-28 rounded-xl bg-gradient-to-br from-[#8A63FF]/15 to-purple-100 flex items-center justify-center mb-4">
                                        <Sparkles className="w-10 h-10 text-[#8A63FF]" />
                                      </div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs border px-2 py-0.5 rounded-full font-mont ${(uLearnStatusConfig[course.generationStatus] || uLearnStatusConfig.pending).style}`}>
                                          {(uLearnStatusConfig[course.generationStatus] || uLearnStatusConfig.pending).label}
                                        </span>
                                        <span className="text-xs border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full capitalize font-mont">{course.skillLevel}</span>
                                      </div>
                                      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 font-mont group-hover:text-[#8A63FF] transition-colors">{course.title}</h3>
                                      <p className="text-gray-400 text-xs mb-3 line-clamp-1 font-mont">{course.description}</p>
                                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                                        <div className="bg-[#8A63FF] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400 font-mont">{done}/{total} chapters · {pct}%</span>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs font-mont">
                                          <Clock className="w-3 h-3" /> ~{course.estimatedHours}h
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* ══════════════════════════════════════════
            GROUP STUDY TAB
        ══════════════════════════════════════════ */}
                      {uLearnTab === "group-study" && (
                        <div className="w-full">

                          {/* ── Invite link success banner ── */}
                          {createdInviteLink && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                  <Users className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-green-800">Group created! Share this invite link</p>
                                  <p className="text-xs text-green-600 truncate">{createdInviteLink}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => { navigator.clipboard.writeText(createdInviteLink); toast.success("Copied!"); }}
                                className="shrink-0 flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </button>
                            </div>
                          )}

                          {/* ── Header row ── */}
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h2 className="text-xl font-bold text-gray-800 font-mont">Group Study</h2>
                              <p className="text-sm text-gray-400 font-mont mt-0.5">Create a shared AI course and split the cost with your study group.</p>
                            </div>
                            <button
                              onClick={() => { setShowCreateGroup(v => !v); setCreatedInviteLink(null); }}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-mont transition-all ${showCreateGroup
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-[#8A63FF] text-white hover:bg-[#7A53EF] shadow-md"
                                }`}
                            >
                              {showCreateGroup ? "Cancel" : <><Plus className="w-4 h-4" /> Create Group Course</>}
                            </button>
                          </div>

                          {/* ── Create Group Form ── */}
                          {showCreateGroup && (
                            <div className="bg-white border border-purple-100 rounded-2xl p-6 mb-8 shadow-sm">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0">
                                  <Users className="w-5 h-5 text-[#8A63FF]" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900 font-mont">New Group Course</h3>
                                  <p className="text-sm text-gray-400 font-mont">Set the topic, group size and deadline, then share the invite link.</p>
                                </div>
                              </div>

                              <form onSubmit={handleCreateGroup} className="space-y-4">
                                {/* Title + Topic */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block font-mont">Course Title</label>
                                    <input
                                      value={groupForm.title}
                                      onChange={e => setGroupForm(p => ({ ...p, title: e.target.value }))}
                                      placeholder="e.g. JavaScript Mastery"
                                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A63FF]/40 focus:border-[#8A63FF] font-mont"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block font-mont">Topic</label>
                                    <input
                                      value={groupForm.topic}
                                      onChange={e => setGroupForm(p => ({ ...p, topic: e.target.value }))}
                                      placeholder="e.g. Advanced JavaScript"
                                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A63FF]/40 focus:border-[#8A63FF] font-mont"
                                    />
                                  </div>
                                </div>

                                {/* Group Size + Skill Level */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block font-mont">Group Size</label>
                                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#8A63FF]/40 focus-within:border-[#8A63FF]">
                                      <button
                                        type="button"
                                        onClick={() => setGroupForm(p => ({ ...p, groupSize: Math.max(2, p.groupSize - 1) }))}
                                        className="px-3 py-2.5 text-gray-400 hover:text-[#8A63FF] hover:bg-purple-50 transition-colors font-bold text-lg"
                                      >−</button>
                                      <span className="flex-1 text-center text-sm font-semibold text-gray-900 font-mont">
                                        {groupForm.groupSize} people
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setGroupForm(p => ({ ...p, groupSize: Math.min(20, p.groupSize + 1) }))}
                                        className="px-3 py-2.5 text-gray-400 hover:text-[#8A63FF] hover:bg-purple-50 transition-colors font-bold text-lg"
                                      >+</button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block font-mont">Skill Level</label>
                                    <select
                                      value={groupForm.skillLevel}
                                      onChange={e => setGroupForm(p => ({ ...p, skillLevel: e.target.value }))}
                                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A63FF]/40 focus:border-[#8A63FF] font-mont"
                                    >
                                      <option value="mixed">Mixed</option>
                                      <option value="beginner">Beginner</option>
                                      <option value="intermediate">Intermediate</option>
                                      <option value="advanced">Advanced</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Registration Deadline */}
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 mb-1 block font-mont flex items-center gap-1.5">
                                    <CalendarClock className="w-3.5 h-3.5" /> Registration Deadline
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={groupForm.registrationDeadline}
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={e => setGroupForm(p => ({ ...p, registrationDeadline: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A63FF]/40 focus:border-[#8A63FF] font-mont"
                                  />
                                </div>

                                {/* Info note */}
                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                                  <Sparkles className="w-4 h-4 text-[#8A63FF] shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-[#8A63FF] font-mont">AI decides the price</p>
                                    <p className="text-xs text-gray-500 font-mont mt-0.5">
                                      After the AI builds your curriculum, it sets a fair price based on the number of chapters.
                                      The cost is then split evenly across {groupForm.groupSize} people.
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  disabled={groupCreating}
                                  className="w-full bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold py-3 rounded-full disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-mont"
                                >
                                  {groupCreating
                                    ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
                                    : <><Users className="w-4 h-4" /> Create & Build Curriculum</>}
                                </button>
                              </form>

                            </div>
                          )}

                          {/* ── My Groups List ── */}
                          {groupsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8A63FF] mb-4" />
                              <p className="text-gray-400 font-mont text-sm">Loading your groups…</p>
                            </div>
                          ) : myGroups.length === 0 && !showCreateGroup ? (
                            <div className="w-full text-center py-16 bg-white rounded-2xl border border-dashed border-purple-200">
                              <Users className="w-12 h-12 text-[#8A63FF]/30 mx-auto mb-3" />
                              <h3 className="text-lg font-semibold text-gray-700 mb-1 font-mont">No group courses yet</h3>
                              <p className="text-gray-400 text-sm font-mont">Create a group course and invite your friends to study together.</p>
                              <button
                                onClick={() => setShowCreateGroup(true)}
                                className="mt-4 bg-[#8A63FF] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#7A53EF] transition-colors font-mont"
                              >
                                Create Group Course
                              </button>
                            </div>
                          ) : myGroups.length > 0 && (
                            <>
                              <h3 className="text-base font-bold text-gray-800 font-mont mb-4">
                                My Groups ({myGroups.length})
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {myGroups.map((group) => {
                                  const deadline = new Date(group.registrationDeadline);
                                  const isExpired = new Date() > deadline;
                                  const paidCount = group.members.filter(m => m.paymentStatus === "paid").length;
                                  const inviteLink = `${window.location.origin}/learn/group-study/join/${group.inviteToken}`;
                                  const { user } = useAuth();
                                  const myMember = group.members.find(
                                    (m: any) => (m.userId?._id || m.userId)?.toString() === user?.id?.toString()
                                  );
                                  const groupStatusStyle: Record<string, string> = {
                                    open: "text-green-700 bg-green-50 border-green-200",
                                    locked: "text-orange-700 bg-orange-50 border-orange-200",
                                    active: "text-[#8A63FF] bg-purple-50 border-purple-200",
                                    cancelled: "text-red-700 bg-red-50 border-red-200",
                                  };

                                  return (
                                    <div key={group._id} className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all p-5 flex flex-col gap-4">

                                      {/* Card Header */}
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-10 h-10 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0">
                                            <Users className="w-5 h-5 text-[#8A63FF]" />
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm font-mont truncate">{group.title}</h4>
                                            <p className="text-xs text-gray-400 font-mont capitalize">{group.skillLevel} · {group.topic}</p>
                                          </div>
                                        </div>
                                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${groupStatusStyle[group.status]}`}>
                                          {group.status.toUpperCase()}
                                        </span>
                                      </div>

                                      {/* Stats Grid */}
                                      <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-gray-50 rounded-xl py-2 px-1">
                                          <p className="text-sm font-bold text-gray-900 font-mont">{group.members.length}/{group.groupSize}</p>
                                          <p className="text-[10px] text-gray-400 font-mont">Joined</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl py-2 px-1">
                                          <p className="text-sm font-bold text-[#8A63FF] font-mont">${group.pricePerPerson}</p>
                                          <p className="text-[10px] text-gray-400 font-mont">Per Person</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl py-2 px-1">
                                          <p className="text-sm font-bold text-gray-900 font-mont">{paidCount}</p>
                                          <p className="text-[10px] text-gray-400 font-mont">Paid</p>
                                        </div>
                                      </div>

                                      {/* Deadline */}
                                      <div className={`flex items-center gap-2 text-xs font-mont px-3 py-2 rounded-xl ${isExpired ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                                        }`}>
                                        <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                                        <span>
                                          {isExpired
                                            ? "Registration closed"
                                            : `Closes ${formatDistanceToNow(deadline, { addSuffix: true })}`}
                                        </span>
                                      </div>

                                      {/* Redistribution notice */}
                                      {group.redistributionTriggered && group.redistributionAmount > 0 && (
                                        <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 text-xs text-orange-700 font-mont">
                                          ⚠️ Extra ${group.redistributionAmount.toFixed(0)}/person due to no-shows
                                        </div>
                                      )}

                                      {/* Action Buttons */}
                                      <div className="flex gap-2 mt-auto">
                                        {/* Copy Invite Link */}
                                        {group.status === "open" && !isExpired && (
                                          <button
                                            onClick={() => copyInviteLink(inviteLink, group._id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 border border-[#8A63FF]/30 text-[#8A63FF] hover:bg-[#8A63FF]/5 rounded-full py-2 text-xs font-semibold font-mont transition-colors"
                                          >
                                            {copiedGroupId === group._id
                                              ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                                              : <><Copy className="w-3.5 h-3.5" /> Copy Invite</>}
                                          </button>
                                        )}

                                        {/* View Group */}
                                        <button
                                          onClick={() => navigate(`/learn/group-study/${group._id}`)}
                                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#8A63FF] text-white hover:bg-[#7A53EF] rounded-full py-2 text-xs font-semibold font-mont transition-colors"
                                        >
                                          {group.status === "active" ? "Go to Course →" : "View Group →"}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : filteredCourses?.length > 0 ? (

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                  {filteredCourses?.map((course, index) => {
                    return (
                      <div key={index} className="w-full">
                        <CourseCardWithActions
                          course={course}
                          isSupervised={mode === "supervised"}
                          onCardClick={() => {
                            if (course.driveUrl) {
                              navigate("/book");
                            } else if (course?._id) {
                              navigate(`/course/${course?._id}`);
                            } else {
                              navigate("/carddetail", { state: { course } });
                            }
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="w-full text-center py-12 text-gray-500">
                  No courses found matching your filters.
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <PurpleBox />
      <WallOfLove />
      <Footer />
    </div>
  );
};

// ✅ UPDATED CourseCardWithActions Component with 3 States
interface CourseCardWithActionsProps {
  course: Course;
  isSupervised: boolean;
  onCardClick: () => void;
}

const CourseCardWithActions: React.FC<CourseCardWithActionsProps> = ({
  course,
  isSupervised,
  onCardClick,
}) => {
  console.log(course);
  useEffect(() => {
    if (!course) {
      return;
    }
  }, [course]);
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlist();
  const { data: enrollmentsData } = useEnrollments(); // ✅ Get enrollments

  // ✅ Check if course is in cart (State 2)
  const isInCart =
    cartData?.data?.items?.some((item) => item.course._id === course._id) ||
    false;

  // ✅ Check if course is enrolled (State 3 - after checkout)
  const userEnrollment = enrollmentsData?.data?.find(
    (enrollment: any) => enrollment.courseId?._id === course._id,
  );
  const isEnrolled = !!userEnrollment;

  // ✅ Check if course is in wishlist
  const isInWishlist =
    wishlistData?.data?.items?.some((item) => item.course._id === course._id) ||
    false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/Signup", { state: { from: location.pathname } });
      return;
    }

    if (!course._id) {
      toast.error("Course ID not found");
      return;
    }
    addToCartMutation.mutate(course._id);
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!course._id) {
      toast.error("Course ID not found");
      return;
    }
    removeFromCartMutation.mutate(course._id);
  };

  const [isQualified, setIsQualified] = useState(true); // Default true for basic courses
  const [showEntranceModal, setShowEntranceModal] = useState(false);
  const [checkingQualification, setCheckingQualification] = useState(false);

  useEffect(() => {
    const checkQualification = async () => {
      const level = course.level?.toLowerCase() || "";

      // Only check for Intermediate or Advanced courses
      // Beginner courses are automatically qualified (handled in render logic too)
      if (level === "beginner") {
        setIsQualified(true);
        setCheckingQualification(false);
        return;
      }

      if (
        (level === "intermediate" || level === "advanced") &&
        isAuthenticated &&
        course._id
      ) {
        setCheckingQualification(true);
        try {
          const status = await assessmentService.getQualificationStatus(
            course._id,
          );
          setIsQualified(status.qualified);
        } catch (error) {
          console.error("Error checking qualification:", error);
          // If error (e.g. 404 test not found), maybe default to false to be safe?
        } finally {
          setCheckingQualification(false);
        }
      }
    };

    checkQualification();
  }, [course._id, course.level, isAuthenticated]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/Signup", { state: { from: location.pathname } });
      return;
    }

    if (!course._id) {
      toast.error("Course ID not found");
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(course._id);
    } else {
      addToWishlistMutation.mutate(course._id);
    }
  };

  const handleTakeExitTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/Signup", { state: { from: location.pathname } });
      return;
    }
    setShowEntranceModal(true);
  };

  const isWishlistLoading =
    addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  return (
    <div
      className="relative w-full h-full group cursor-pointer"
      onClick={onCardClick}
    >
      <Recard course={course} />

      {isSupervised && (
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex gap-2">
            {/* ✅ THREE STATES: Not in cart, In cart, Enrolled */}
            {isEnrolled ? (
              userEnrollment?.paymentStatus === "completed" ? (
                // ✅ STATE 4: Enrolled & Approved - Show "Access Course" (GREEN/ACTION)
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg text-xs sm:text-sm h-9 px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/course/${course._id}`);
                  }}
                >
                  <span className="hidden sm:inline">Access Course</span>
                  <span className="sm:hidden">Access</span>
                </Button>
              ) : (
                // ✅ STATE 3: Enrolled but Pending - Show "Will be Unlocked Soon" (LOCKED)
                <div className="flex-1 flex flex-col gap-1">
                  <Button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300 shadow-lg text-xs sm:text-sm h-9 px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Lock className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">
                      Will be Unlocked Soon
                    </span>
                    <span className="sm:hidden">Locked</span>
                  </Button>
                  <p className="text-[10px] text-gray-600 text-center">
                    Payment Approval Pending
                  </p>
                </div>
              )
            ) : isInCart ? (
              // ✅ STATE 2: In Cart (before checkout) - Show "Remove from Cart" (RED)
              <Button
                onClick={handleRemoveFromCart}
                disabled={removeFromCartMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg text-xs sm:text-sm h-9 px-3"
              >
                {removeFromCartMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Remove from Cart</span>
                    <span className="sm:hidden">Remove</span>
                  </>
                )}
              </Button>
            ) : !isQualified ? (
              // ✅ STATE 1.5: Entrance Test Required (BLUE)
              <Button
                onClick={handleTakeExitTest}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-xs sm:text-sm h-9 px-3"
              >
                {checkingQualification ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Take Entrance Test</span>
                    <span className="sm:hidden">Test</span>
                  </>
                )}
              </Button>
            ) : (
              // ✅ STATE 1: Default - Show "Add to Cart" (PURPLE)
              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex-1 bg-[#8A63FF] hover:bg-[#7047e0] text-white shadow-lg text-xs sm:text-sm h-9 px-3"
              >
                {addToCartMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">+</span>
                  </>
                )}
              </Button>
            )}

            {/* ✅ Wishlist Button (hide if enrolled) */}
            {!isEnrolled && (
              <Button
                onClick={handleToggleWishlist}
                disabled={isWishlistLoading}
                variant="outline"
                size="icon"
                className={`shadow-lg transition-all duration-200 h-9 w-9 flex-shrink-0 ${isInWishlist
                  ? "bg-red-50 hover:bg-red-100 border-red-400"
                  : "bg-white hover:bg-gray-100 border-gray-300"
                  }`}
                title={
                  isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                }
              >
                {isWishlistLoading ? (
                  <div
                    className={`h-4 w-4 border-2 border-t-transparent rounded-full animate-spin ${isInWishlist ? "border-red-600" : "border-[#8A63FF]"
                      }`}
                  />
                ) : (
                  <Heart
                    className={`w-4 h-4 transition-all duration-200 ${isInWishlist
                      ? "text-red-600 fill-red-600"
                      : "text-[#8A63FF]"
                      }`}
                    style={{
                      fill: isInWishlist ? "currentColor" : "none",
                    }}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {showEntranceModal && (
        <EntranceTestModal
          isOpen={showEntranceModal}
          onClose={() => setShowEntranceModal(false)}
          courseId={course._id || ""}
          courseTitle={course.title}
          onPass={() => {
            setIsQualified(true);
            addToCartMutation.mutate(course._id!);
          }}
        />
      )}
    </div>
  );
};

// FilterSection Component (unchanged)
interface FilterSectionProps {
  initialActiveButton?: "supervised" | "unsupervised";
  description?: string;
  onToggle?: (activeButton: "supervised" | "unsupervised") => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortOption: string;
  onSortOptionChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  initialActiveButton,
  description,
  onToggle,
  searchQuery,
  onSearchQueryChange,
  sortOption,
  onSortOptionChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [activeButton, setActiveButton] = useState(
    initialActiveButton || "supervised",
  );

  const handleToggle = (button: "supervised" | "unsupervised") => {
    setActiveButton(button);
    onToggle?.(button);
  };

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-4 flex-col">
            <div
              className="flex items-center bg-white-500 p-1 rounded-full"
              style={{ boxShadow: "0px 0px 22.4px 0px #00000040" }}
            >
              <button
                onClick={() => handleToggle("supervised")}
                className={`px-4 py-2 rounded-full font-semibold ${activeButton === "supervised"
                  ? "bg-[#8A63FF] text-white"
                  : "bg-white text-gray-600"
                  }`}
              >
                Supervised
              </button>
              <button
                onClick={() => handleToggle("unsupervised")}
                className={`px-4 py-2 rounded-full font-semibold ${activeButton === "unsupervised"
                  ? "bg-[#8A63FF] text-white"
                  : "bg-white text-[#8A63FF]"
                  }`}
              >
                Unsupervised
              </button>
            </div>
            <span className="text-sm text-[#8A63FF] text-center">
              {description}
            </span>
          </div>
        </div>
        <div className="p-10 w-full h-auto">
          <h2 className="text-2xl font-semibold mb-6">Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search in your courses..."
                className="w-full rounded-full border px-4 py-2 pl-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => onSortOptionChange(e.target.value)}
                className="w-full rounded-full border px-4 py-2"
              >
                <option>Most Popular</option>
                <option>Highest Rated</option>
                <option>Newest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full rounded-full border px-4 py-2"
              >
                <option>All Courses</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Not Started</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Course;

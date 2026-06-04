import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Volume2, Mic, MessageCircle,
  ClipboardList, CheckCircle, XCircle, Zap, X, Send, Loader2,
  AlertCircle, BookOpen, BookMarked, Sparkles, Hash,
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Brain
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ChapterVideoPlayer from "@/components/ChapterVideoPlayer";
import {
  getCourse, getOrGenerateQuiz, getOrGeneratePodcast, completeChapter,
  streamTutorAnswer, getChatHistory, type ULearnCourse, type ULearnChapter, type QuizQuestion, type ChatHistory
} from "@/services/ulearnService";
import { useBookByCourse, useBook, useBookChapter, useCourseStats } from "@/hooks/useBooks";
import { useAuth } from "@/App";
import { useQueryClient } from "@tanstack/react-query";



// ─────────────────────────────────────────────────────────
// INLINE SECTION READER
// ─────────────────────────────────────────────────────────
const InlineSectionReader = ({
  bookId,
  chapterId,
}: {
  bookId: string;
  chapterId: string;
}) => {
  const { data, isLoading, isError, refetch } = useBookChapter(bookId, chapterId, true);
  const chapter = data?.data;
  console.log(data, "chapter data");


  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-7 w-7 border-t-4 border-b-4 border-[#8A63FF]" />
      </div>
    );
  }

  if (isError || !chapter) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm mb-3">Could not load chapter content.</p>
        <button
          onClick={() => refetch()}
          className="text-[#8A63FF] text-sm hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chapter meta */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
        <p className="text-xs text-[#8A63FF] font-semibold uppercase tracking-wider mb-1">
          Book Chapter
        </p>
        <h3 className="text-base font-bold text-gray-900">{chapter.title}</h3>
        {chapter.summary && (
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{chapter.summary}</p>
        )}
        <div className="flex gap-3 mt-3 text-xs text-gray-400">
          <span>{chapter.sections.length} sections</span>
          <span>·</span>
          <span>{chapter.totalWordCount?.toLocaleString()} words</span>
        </div>
      </div>

      {/* Sections */}
      {chapter.sections.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">No sections yet.</p>
      ) : (
        chapter.sections.map((section: any) => (
          <div
            key={section._id}
            className="border border-gray-100 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 border-b border-gray-100">
              <Hash className="w-3.5 h-3.5 text-[#8A63FF] shrink-0" />
              {/* sectionTitle already includes "Section N: ..." prefix from AI */}
              <p className="text-sm font-medium text-gray-800">{section.title}</p>
              <span className="ml-auto text-xs text-gray-400 shrink-0">
                {section.wordCount?.toLocaleString()} words
              </span>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};


// ─────────────────────────────────────────────────────────
// BOOK SECTION
// ─────────────────────────────────────────────────────────
const BookSection = ({ courseId }: { courseId: string }) => {
  const [bookOpen, setBookOpen] = useState(false);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);

  // Step 1 — get status/bookId from main server
  const {
    data: bookMeta,
    isLoading: metaLoading,
  } = useBookByCourse(courseId);

  console.log(bookMeta);


  const status = bookMeta?.status ?? "not_started";
  const bookId = bookMeta?.bookId ?? null;
  const bookGenerated = bookMeta?.bookGenerated ?? false;
  const progress = bookMeta?.progress ?? null;

  // Step 2 — fetch full TOC only when opened and book is ready
  const {
    data: bookData,
    isLoading: bookLoading,
  } = useBook(bookId ?? undefined, bookOpen && !!bookId && bookGenerated);

  const book = bookData?.data;
  console.log(bookData, "book Data");

  const activeChapter = book?.chapters?.[activeChapterIdx];

  // ── 1. Initial meta loading ────────────────────────────
  if (metaLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-md p-6 mb-5 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#8A63FF]" />
        <p className="text-gray-400 text-sm">Checking book status…</p>
      </div>
    );
  }

  // ── 2. Not started ─────────────────────────────────────
  if (status === "not_started" || !bookId) {
    return (
      <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Custom Book</p>
            <p className="text-xs text-gray-400">
              Your personalised book hasn't been created yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. Generating ──────────────────────────────────────
  if (!bookGenerated && (status === "pending" || status === "generating")) {
    return (
      <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
        <div className="flex flex-col items-center text-center py-2">
          {/* Animated icon */}
          <div className="relative w-14 h-14 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#8A63FF]/10 flex items-center justify-center animate-pulse">
              <BookMarked className="w-7 h-7 text-[#8A63FF]" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#8A63FF]" />
            </span>
          </div>

          <p className="text-xs font-semibold text-[#8A63FF] uppercase tracking-wider mb-1">
            AI Author at Work
          </p>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            Creating your custom book
          </h3>
          <p className="text-xs text-gray-400 max-w-xs">
            Your personalised textbook is being written. It'll be ready to read once complete.
          </p>

          {/* Progress bar */}
          {progress ? (
            <div className="w-full max-w-xs mt-5">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{progress.completedChapters}/{progress.totalChapters} chapters</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#8A63FF] to-purple-400 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-1.5 mt-5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#8A63FF]/40 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 4. Failed ──────────────────────────────────────────
  if (status === "failed") {
    return (
      <div className="bg-white rounded-[20px] shadow-md p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Book generation failed</p>
            <p className="text-xs text-gray-400">The admin will regenerate it shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── 5. Ready — open in new tab ─────────────────────────
  return (
    <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#8A63FF]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Your Custom Book
              <span className="inline-flex items-center gap-1 text-xs text-[#8A63FF] bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Ready
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {bookMeta?.bookTitle ?? "AI-generated textbook for this course"}
            </p>
          </div>
        </div>

        {/* ✅ Opens /learn/book/:courseId in a new tab */}
        <button
          onClick={() => window.open(`/learn/book/${courseId}`, "_blank")}
          className="flex items-center gap-2 bg-[#8A63FF] hover:bg-[#7A53EF] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shrink-0"
        >
          <BookOpen className="w-4 h-4" /> Read Book
        </button>
      </div>
    </div>
  );

};


// ─────────────────────────────────────────────────────────
// CHAPTER VIEW (main page)
// ─────────────────────────────────────────────────────────
const ChapterView = () => {
  const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.id || user?._id || "";
  const queryClient = useQueryClient();
  const { data: stats } = useCourseStats(courseId);

  const moduleIdx: number = (location.state as any)?.moduleIdx ?? 0;
  const chapterIdx: number = (location.state as any)?.chapterIdx ?? 0;
  const strictMode: boolean = (location.state as any)?.strictMode ?? false;
  const passedQuizCredits = (location.state as any)?.quizCredits ?? null;
  const passedQuestionCredits = (location.state as any)?.questionCredits ?? null;


  const [course, setCourse] = useState<ULearnCourse | null>(null);
  const [chapter, setChapter] = useState<ULearnChapter | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz
  const [quizVisible, setQuizVisible] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizCreditsRemaining, setQuizCreditsRemaining] = useState<number | null>(passedQuizCredits);
  const [chapterCompleted, setChapterCompleted] = useState(false);

  // Tutor
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorMessages, setTutorMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [tutorStreaming, setTutorStreaming] = useState(false);
  const [tutorCredits, setTutorCredits] = useState<number | null>(passedQuestionCredits);
  const tutorEndRef = useRef<HTMLDivElement>(null);

  // Chat History
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<ChatHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const openHistory = async () => {
    setHistoryOpen(true);
    if (!courseId || !chapterId) return;
    try {
      setHistoryLoading(true);
      const data = await getChatHistory(courseId);
      // Filter for this chapter specifically
      const chapterHistory = data.find((d) => d.chapterId === chapterId) || null;
      setHistoryData(chapterHistory);
    } catch {
      toast.error("Could not load chat history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Podcast
  const [podcastLoading, setPodcastLoading] = useState(false);
  const [podcastAudio, setPodcastAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        const c = await getCourse(courseId);
        setCourse(c);
        const ch = c.modules[moduleIdx]?.chapters[chapterIdx];
        setChapter(ch || null);
        setChapterCompleted(c.completedChapterIds?.includes(ch?._id || "") || false);
      } catch { toast.error("Could not load chapter."); }
      finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  useEffect(() => {
    tutorEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tutorMessages]);

  useEffect(() => {
    if (stats) {
      if (passedQuizCredits === null) setQuizCreditsRemaining(stats.quizCredits);
      if (passedQuestionCredits === null) setTutorCredits(stats.questionCredits);
    }
  }, [stats]);

  const [isReading, setIsReading] = useState(false);

  const handleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    if (!chapter?.content) return;
    window.speechSynthesis.cancel();

    const cleanText = chapter.content
      .replace(/#{1,6}\s+/g, "")           // ## headings
      .replace(/\*\*(.*?)\*\*/g, "$1")     // **bold**
      .replace(/\*(.*?)\*/g, "$1")         // *italic*
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, "") // `code`
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [link](url)
      .replace(/[-*+]\s/g, "")            // bullet points
      .replace(/[#>_~|]/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();

    if (!cleanText) { toast.error("No content to read."); return; }

    setIsReading(true);
    toast.success("Read-aloud started.");

    // Split into sentences to avoid length limits
    const chunks = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    let chunksPlayed = 0;

    chunks.forEach((chunk) => {
      const utt = new SpeechSynthesisUtterance(chunk.trim());
      utt.rate = 0.9;
      utt.lang = "en-US";
      utt.onend = () => {
        chunksPlayed++;
        if (chunksPlayed === chunks.length) {
          setIsReading(false);
        }
      };
      utt.onerror = () => {
        chunksPlayed++;
        if (chunksPlayed === chunks.length) {
          setIsReading(false);
        }
      };
      window.speechSynthesis.speak(utt);
    });
  };


  const handlePodcast = async () => {
    if (podcastAudio) { audioRef.current?.play(); return; }
    setPodcastLoading(true);
    try {
      const res = await getOrGeneratePodcast({
        chapterId: chapter!._id,
        chapterTitle: chapter!.title,
        chapterContent: chapter?.content || chapter?.summary || "",
      });
      if (res.audioBase64) {
        const url = `data:audio/mp3;base64,${res.audioBase64}`;
        setPodcastAudio(url);
        setTimeout(() => audioRef.current?.play(), 100);
      }
    } catch { toast.error("Podcast generation failed."); }
    finally { setPodcastLoading(false); }
  };

  const handleOpenQuiz = async () => {
    if (questions.length > 0) { setQuizVisible(true); return; }
    setQuizLoading(true);
    setQuizVisible(true);
    try {
      const res = await getOrGenerateQuiz({
        courseId: courseId!,
        chapterId: chapter!._id,
        courseTitle: course?.title || "",
        chapterTitle: chapter!.title,
        chapterContent: chapter?.content || "",
      });
      setQuestions(res.quiz.questions);
      setQuizCreditsRemaining(res.creditsRemaining);
      queryClient.invalidateQueries({ queryKey: ["ulearn-stats"] });
    } catch (err: any) {
      if (err?.response?.status === 402) toast.error("No quiz credits remaining!");
      else toast.error("Quiz generation failed.");
      setQuizVisible(false);
    } finally { setQuizLoading(false); }
  };

  const handleQuizSubmit = async () => {
    const correct = questions.filter((q, i) => quizAnswers[i] === q.correctAnswer).length;
    const passed = correct >= 3;
    setQuizSubmitted(true);
    setQuizPassed(passed);
    if (passed && !chapterCompleted) {
      try {
        const result = await completeChapter({
          courseId: courseId!, chapterId: chapter!._id,
          xpReward: chapter!.xpReward || 100, moduleIdx, chapterIdx,
        });
        setChapterCompleted(true);
        queryClient.invalidateQueries({ queryKey: ["ulearn-stats"] });
        toast.success(`+${result.xpEarned} XP earned!${result.leveledUp ? " 🎉 Level Up!" : ""}`);
      } catch { toast.error("Could not save progress."); }
    }
  };

  const tutorRequestInFlight = useRef(false); // ✅ add this ref

  const handleAskTutor = async () => {
    // ✅ ref check fires instantly, unlike state
    if (!tutorQuestion.trim() || tutorStreaming || tutorRequestInFlight.current) return;

    tutorRequestInFlight.current = true; // ✅ lock immediately

    const q = tutorQuestion.trim();
    setTutorQuestion("");
    setTutorMessages((p) => [...p, { role: "user", text: q }]);
    setTutorStreaming(true);
    let aiText = "";
    setTutorMessages((p) => [...p, { role: "ai", text: "" }]);

    try {
      await streamTutorAnswer(
        { courseId: courseId!, chapterId: chapter!._id, chapterTitle: chapter!.title, chapterContent: chapter?.content || "", question: q, userId },
        (delta) => {
          aiText += delta;
          setTutorMessages((p) => {
            const m = [...p];
            m[m.length - 1] = { role: "ai", text: aiText };
            return m;
          });
        },
        (credits) => {
          setTutorStreaming(false);
          tutorRequestInFlight.current = false; // ✅ unlock
          if (credits !== undefined) {
             setTutorCredits(credits);
             queryClient.invalidateQueries({ queryKey: ["ulearn-stats"] });
          }
        },
        (err) => {
          setTutorStreaming(false);
          tutorRequestInFlight.current = false; // ✅ unlock on error
          toast.error(err.includes("credits") ? "No question credits remaining!" : err);
          setTutorMessages((p) => p.slice(0, -1));
        },
      );
    } catch {
      setTutorStreaming(false);
      tutorRequestInFlight.current = false; // ✅ unlock on exception
    }
  };

  const flatChapters = course?.modules.flatMap((m, mIdx) =>
    m.chapters.map((c, cIdx) => ({ ...c, mIdx, cIdx }))) || [];
  const curFlatIdx = flatChapters.findIndex((c) => c._id === chapterId);
  const prevCh = flatChapters[curFlatIdx - 1];
  const nextCh = flatChapters[curFlatIdx + 1];

  if (loading) return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8A63FF]" />
      </div>
    </div>
  );

  if (!chapter) return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-500">
        Chapter not found.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <button
          onClick={() => navigate(`/learn/course/${courseId}`)}
          className="flex items-center gap-1 text-gray-400 hover:text-[#8A63FF] text-sm mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Course
        </button>

        {/* Chapter header */}
        <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-[#8A63FF] text-xs font-semibold mb-2 flex flex-wrap items-center gap-3">
                <span>Ch {chapterIdx + 1} · Module {moduleIdx + 1}</span>
                {quizCreditsRemaining !== null && (
                  <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    <ClipboardList className="w-3.5 h-3.5" /> {quizCreditsRemaining} Quizzes
                  </span>
                )}
                {tutorCredits !== null && (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <Brain className="w-3.5 h-3.5" /> {tutorCredits} AI Qs
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{chapter.title}</h1>
              {chapterCompleted && (
                <div className="flex items-center gap-1.5 text-[#8A63FF] text-sm mt-2">
                  <CheckCircle className="w-4 h-4" /> Completed
                </div>
              )}
            </div>
            <span className="flex items-center gap-1 text-[#8A63FF] bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0 ml-4">
              <Zap className="w-3.5 h-3.5" /> {chapter.xpReward} XP
            </span>
          </div>

          {/* Toolbar */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={handleReadAloud}
              className={`flex items-center gap-1.5 border px-4 py-2 rounded-full transition-all text-xs ${isReading
                ? "bg-purple-100 border-purple-300 text-[#8A63FF]"
                : "bg-gray-50 hover:bg-purple-50 border-gray-200 hover:border-purple-200 hover:text-[#8A63FF] text-gray-600"
                }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isReading ? "Stop Reading" : "Read Aloud"}
            </button>
            <button
              onClick={handlePodcast}
              disabled={podcastLoading}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 hover:text-[#8A63FF] text-gray-600 text-xs px-4 py-2 rounded-full transition-all disabled:opacity-60"
            >
              {podcastLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Mic className="w-3.5 h-3.5" />}
              {podcastLoading ? "Generating…" : podcastAudio ? "▶ Play" : "🎙 Podcast"}
            </button>
            <button
              onClick={() => setTutorOpen(true)}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 hover:text-[#8A63FF] text-gray-600 text-xs px-4 py-2 rounded-full transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Ask AI Tutor
              {tutorCredits !== null && (
                <span className="text-gray-400">({tutorCredits})</span>
              )}
            </button>
            <button
              onClick={openHistory}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 hover:text-[#8A63FF] text-gray-600 text-xs px-4 py-2 rounded-full transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" /> History
            </button>
          </div>
        </div>

        {/* Podcast Player */}
        {podcastAudio && (
          <div className="bg-white border border-purple-100 rounded-[20px] shadow-md p-4 mb-5 flex items-center gap-3">
            <Mic className="w-5 h-5 text-[#8A63FF] shrink-0" />
            <div className="flex-1">
              <p className="text-gray-800 text-sm font-semibold mb-1">
                🎙 Podcast: {chapter.title}
              </p>
              <audio ref={audioRef} src={podcastAudio} controls className="w-full h-8" />
            </div>
          </div>
        )}

        {/* AI Video Lesson */}
        {courseId && chapter && (
          <div className="mb-5">
            <ChapterVideoPlayer
              courseId={courseId}
              chapterId={chapter._id}
              chapterTitle={chapter.title}
              chapterContent={chapter.content}
            />
          </div>
        )}

        {/* Chapter Content */}
        {chapter.content ? (
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-5 prose prose-purple max-w-none text-gray-800 prose-headings:text-gray-900 prose-a:text-[#8A63FF]">
            <ReactMarkdown>{chapter.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-5 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#8A63FF] mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Content is still being generated. Refresh in a moment.
            </p>
          </div>
        )}

        {/* Quiz Section */}
        {!quizVisible ? (
          <div className="bg-white rounded-[20px] shadow-md p-6 text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-[#8A63FF]/10 flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6 text-[#8A63FF]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Ready to test your knowledge?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Pass the quiz to unlock the next chapter and earn {chapter.xpReward} XP.
            </p>
            {quizCreditsRemaining !== null && (
              <p className="text-gray-300 text-xs mb-4">
                {quizCreditsRemaining} quiz credits remaining
              </p>
            )}
            <button
              onClick={handleOpenQuiz}
              className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              {chapterCompleted ? "Retake Quiz" : "Take Quiz →"}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#8A63FF]" /> Chapter Quiz
              </h3>
              {!quizSubmitted && (
                <button onClick={() => setQuizVisible(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {quizLoading ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#8A63FF]" />
                <p className="text-gray-400 text-sm">Generating your quiz…</p>
              </div>
            ) : (
              <div className="space-y-5">
                {questions.map((q, qi) => (
                  <div
                    key={qi}
                    className={`p-4 rounded-xl border ${quizSubmitted
                      ? (quizAnswers[qi] === q.correctAnswer
                        ? "bg-purple-50 border-purple-200"
                        : "bg-red-50 border-red-200")
                      : "bg-gray-50 border-gray-100"}`}
                  >
                    <p className="text-gray-900 font-medium text-sm mb-3">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[qi] === oi;
                        const correct = q.correctAnswer === oi;
                        let cls = "bg-white border-gray-200 text-gray-700";
                        if (quizSubmitted) {
                          if (correct) cls = "bg-[#8A63FF]/10 border-[#8A63FF] text-[#8A63FF] font-medium";
                          else if (selected) cls = "bg-red-100 border-red-300 text-red-700";
                        } else if (selected) cls = "bg-[#8A63FF]/10 border-[#8A63FF] text-[#8A63FF] font-medium";
                        return (
                          <button
                            key={oi}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers((p) => ({ ...p, [qi]: oi }))}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls} ${!quizSubmitted ? "hover:border-[#8A63FF]/50 hover:bg-purple-50" : ""}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && q.explanation && (
                      <p className="text-gray-500 text-xs mt-2 italic">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length !== questions.length}
                    className="w-full bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold py-3 rounded-full disabled:opacity-50 transition-colors"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className={`p-5 rounded-xl text-center border ${quizPassed ? "bg-purple-50 border-purple-200" : "bg-red-50 border-red-200"}`}>
                    {quizPassed ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-[#8A63FF] mx-auto mb-2" />
                        <p className="text-[#8A63FF] font-semibold">
                          Passed! +{chapter.xpReward} XP earned 🎉
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-red-600 font-semibold">Need 3/5 to pass. Try again!</p>
                        <button
                          onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizPassed(false); }}
                          className="mt-3 text-[#8A63FF] text-sm hover:underline"
                        >
                          Retry Quiz
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Book Section ── */}
        {courseId && <BookSection courseId={courseId} />}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            disabled={!prevCh}
            onClick={() => prevCh && navigate(
              `/learn/course/${courseId}/chapter/${prevCh._id}`,
              { state: { moduleIdx: prevCh.mIdx, chapterIdx: prevCh.cIdx, strictMode, quizCredits: quizCreditsRemaining, questionCredits: tutorCredits } }
            )}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#8A63FF] disabled:opacity-30 transition-colors text-sm"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          <button
            disabled={!nextCh || (strictMode && !chapterCompleted)}
            onClick={() => nextCh && (!strictMode || chapterCompleted) && navigate(
              `/learn/course/${courseId}/chapter/${nextCh._id}`,
              { state: { moduleIdx: nextCh.mIdx, chapterIdx: nextCh.cIdx, strictMode, quizCredits: quizCreditsRemaining, questionCredits: tutorCredits } }
            )}
            className="flex items-center gap-2 bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold px-6 py-3 rounded-full disabled:opacity-30 transition-colors text-sm"
          >
            Next Chapter <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Tutor Drawer */}
      {tutorOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/40" onClick={() => setTutorOpen(false)} />
          <div className="bg-white border-t border-gray-200 h-[58vh] flex flex-col max-w-4xl mx-auto w-full rounded-t-3xl shadow-2xl font-mont">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#8A63FF]" /> AI Tutor
                </h3>
                <p className="text-gray-400 text-xs">{chapter.title}</p>
              </div>
              <div className="flex items-center gap-3">
                {tutorCredits !== null && (
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {tutorCredits} questions left
                  </span>
                )}
                <button onClick={() => setTutorOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {tutorMessages.length === 0 && (
                <div className="text-center text-gray-400 mt-8">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Ask anything about this chapter</p>
                </div>
              )}
              {tutorMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.role === "user"
                    ? "bg-[#8A63FF] text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}>
                    {msg.text || (tutorStreaming && i === tutorMessages.length - 1 ? "●●●" : "")}
                  </div>
                </div>
              ))}
              <div ref={tutorEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <input
                type="text"
                value={tutorQuestion}
                onChange={(e) => setTutorQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskTutor()}
                placeholder="Ask about this chapter…"
                className="flex-1 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A63FF]/40 focus:border-[#8A63FF] transition-all"
              />
              <button
                onClick={handleAskTutor}
                disabled={tutorStreaming || !tutorQuestion.trim()}
                className="bg-[#8A63FF] text-white p-2.5 rounded-full hover:bg-[#7A53EF] disabled:opacity-50 transition-colors"
              >
                {tutorStreaming
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Chat History Modal (Chapter Specific) */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setHistoryOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl font-mont">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#8A63FF]" /> Chapter AI Chat History
                </h3>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#8A63FF]" />
                </div>
              ) : !historyData || historyData.chats.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">No chat history found for this chapter.</p>
                </div>
              ) : (
                historyData.chats.map((c, i) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterView;

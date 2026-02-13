/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getCourseById, ICourse } from "@/services/courseService";
import {
  getUserCourseDetails,
  updateCourseProgress,
} from "@/services/profileService";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import courseStructureService, {
  CourseStructure,
  Chapter,
  Subchapter,
} from "@/services/courseStructureService";
import {
  BookOpen,
  FileQuestion,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Eye,
  FileText,
  PlayCircle,
  Video,
  ShieldAlert,
  Maximize2,
  Minimize2,
  ArrowRight,
  Clock,
  Trophy,
  ChevronDown,
  ChevronRight,
  FileX,
  Ban,
  ClipboardList,
  ListChecks,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Loader2,
  Send,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import quizService from "@/services/quizService";
import {
  getAssignmentByChapter,
  Assignment,
} from "@/services/assignmentService";
import { confetti } from "@/lib/confetti";
import ReactMarkdown from "react-markdown";
import StudyMaterialsList from "./StudyMaterialsList";
import learningService from "@/services/learningService";

// --- Types ---
interface ExtendedChapter extends Chapter {
  videoUrl?: string;
}

interface ExtendedSubchapter extends Subchapter {
  studyMaterialUrl?: string;
}

// --- Helper: Google Drive Embedder ---
const getEmbedUrl = (url: string): string => {
  if (!url) return "";
  try {
    if (url.includes("drive.google.com")) {
      let id = "";
      const parts = url.split("/");
      if (url.includes("/file/d/")) {
        const idx = parts.indexOf("d");
        if (idx !== -1 && parts[idx + 1]) id = parts[idx + 1];
      } else if (url.includes("id=")) {
        id = url.split("id=")[1].split("&")[0];
      }
      if (id) return `https://drive.google.com/file/d/${id}/preview`;
    }
    return url;
  } catch (e) {
    return url;
  }
};

// --- COMPONENT: Secure Document Viewer ---
const SecureDocViewer: React.FC<{
  url: string;
  title: string;
  userId: string;
  onClose: () => void;
}> = ({ url, title, userId, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Enter fullscreen on mount
  useEffect(() => {
    const elem = containerRef.current;
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.error(err));
    }
  }, []);

  // Security: block keyboard shortcuts for download/print
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "p" || e.key === "s")) ||
        (e.metaKey && (e.key === "p" || e.key === "s"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("Download/Print disabled.");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      style={
        {
          userSelect: "none",
          WebkitTouchCallout: "none",
        } as React.CSSProperties
      }
    >
      {/* Header Bar */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500 h-5 w-5" />
          <span className="font-mono text-sm text-gray-300">
            SECURE VIEWER MODE
          </span>
        </div>
        <h2 className="font-bold text-lg hidden md:block">{title}</h2>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            onClose();
          }}
        >
          <Minimize2 className="mr-2 h-4 w-4" /> Exit
        </Button>
      </div>

      {/* Document Area */}
      <div className="flex-1 relative bg-gray-800 overflow-hidden">
        {/* Watermark overlay - pointer-events-none so scrolling works through it */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-10 flex flex-wrap content-center justify-center gap-24 rotate-12 select-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="text-white text-2xl font-bold whitespace-nowrap"
            >
              {userId} • DO NOT SHARE
            </div>
          ))}
        </div>

        {/* PDF iframe - z-10 so it's above background but below watermark, scrollable */}
        <iframe
          src={url}
          className="w-full h-full border-0 bg-white relative z-10"
          title="Secure Document"
          onContextMenu={(e) => e.preventDefault()}
          style={{ pointerEvents: "auto" }}
        />
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const LearningModule: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState<ICourse | null>(null);
  const [courseStructure, setCourseStructure] =
    useState<CourseStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Progress State
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  // Sets for O(1) lookups
  const [completedSections, setCompletedSections] = useState<Set<string>>(
    new Set(),
  );
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(
    new Set(),
  );
  const [quizScores, setQuizScores] = useState<{ [quizId: string]: number }>(
    {},
  );
  const [unlockedSubchapters, setUnlockedSubchapters] = useState<Set<string>>(
    new Set(),
  );
  const [currentSubchapter, setCurrentSubchapter] = useState<string | null>(
    null,
  );

  // Signed URL State for secure S3 access
  const [signedUrls, setSignedUrls] = useState<Map<string, string>>(new Map());
  const [urlTimestamps, setUrlTimestamps] = useState<Map<string, number>>(
    new Map(),
  );
  const [, setLoadingSignedUrls] = useState(false); // Used for loading indicator of URLs

  // UI State
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [expandedSubchapters, setExpandedSubchapters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedSection, setSelectedSection] = useState<{
    chapterIndex: number;
    subchapterIndex: number;
    sectionIndex: number;
    title: string;
    content: string;
    videoUrl?: string;
  } | null>(null);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const {
    courseId = "",
    chapterId = "",
    subchapterId = "",
    sectionId = "",
  } = useParams<{
    courseId: string;
    chapterId: string;
    subchapterId: string;
    sectionId: string;
  }>();

  // Fetch assignments
  // Fetch assignments
  React.useEffect(() => {
    const targetCourseId = courseId || id;
    if (targetCourseId) {
      console.log("Fetching assignments for course:", targetCourseId);
      learningService
        .getAssignments(targetCourseId)
        .then((data) => {
          console.log("Assignments API Response:", data);
          setAssignments(data);
        })
        .catch((err) => console.error("Failed to load assignments", err));
    } else {
      console.warn("No course ID found for fetching assignments");
    }
  }, [courseId, id]);

  // Assignment Submission State
  const [submissionLinks, setSubmissionLinks] = useState<{
    [key: string]: string;
  }>({});
  const [submittingIds, setSubmittingIds] = useState<string[]>([]);

  const handleLinkChange = (assignmentId: string, value: string) => {
    setSubmissionLinks((prev) => ({ ...prev, [assignmentId]: value }));
  };

  const handleSubmitAssignment = async (
    assignmentId: string,
    chapterId: string,
  ) => {
    const link = submissionLinks[assignmentId];
    if (!link) {
      toast.error("Please enter a valid submission link");
      return;
    }

    try {
      const targetCourseId = courseId || id;
      if (!targetCourseId) {
        throw new Error("Course ID not found");
      }
      setSubmittingIds((prev) => [...prev, assignmentId]);
      await learningService.submitAssignment(targetCourseId, chapterId, link);
      toast.success("Assignment submitted successfully!");

      // Update local state
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId
            ? {
                ...a,
                status: "submitted",
                submissionLink: link,
                submittedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
    } catch (error: any) {
      console.error("Submission failed", error);
      toast.error(error.message || "Failed to submit assignment");
    } finally {
      setSubmittingIds((prev) => prev.filter((id) => id !== assignmentId));
    }
  };

  // Viewer State
  const [activeDoc, setActiveDoc] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [courseData, structureData, userProfile, attempts] =
          await Promise.all([
            getCourseById(id),
            courseStructureService.getCourseStructure(id),
            getUserCourseDetails(id),
            quizService.getUserQuizAttempts(id),
          ]);

        setCourse(courseData);
        setCourseStructure(structureData);

        // --- Process User Profile ---
        if (userProfile) {
          if (userProfile.startDate)
            setCourseStartDate(new Date(userProfile.startDate));
          if (userProfile.completedSections)
            setCompletedSections(new Set(userProfile.completedSections));
          if (userProfile.unlockedSubchapters)
            setUnlockedSubchapters(new Set(userProfile.unlockedSubchapters));
          if (userProfile.currentSubchapter)
            setCurrentSubchapter(userProfile.currentSubchapter);
          setProgress(userProfile.progress || 0);
          setIsCompleted(userProfile.completed || false);
        }

        // --- Process Quizzes ---
        const completedQ = new Set<string>();
        const scores: any = {};
        attempts.forEach((att: any) => {
          const qId = att.quiz?._id || att.quiz;
          scores[qId] = Math.max(scores[qId] || 0, att.percentage || 0);
          if (att.passed) completedQ.add(qId);
        });
        setCompletedQuizzes(completedQ);
        setQuizScores(scores);

        // --- Initial Selection ---
        if (structureData?.chapters?.length > 0) {
          setExpandedChapters([structureData.chapters[0]._id]);
          if (structureData.chapters[0].subchapters?.length > 0) {
            setExpandedSubchapters([
              structureData.chapters[0].subchapters[0]._id,
            ]);
            const firstSec =
              structureData.chapters[0].subchapters[0].sections[0];
            if (firstSec) {
              setSelectedSection({
                chapterIndex: 0,
                subchapterIndex: 0,
                sectionIndex: 0,
                title: firstSec.title,
                content: firstSec.generatedContent || "",
                videoUrl: firstSec.videoUrl,
              });
            }
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Fetch Signed URLs for all S3 content (videos and study materials)
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!courseStructure) return;

      // Collect all S3 URLs from course structure
      const allS3Keys: string[] = [];

      courseStructure.chapters.forEach((chapter) => {
        // Chapter Videos
        if ((chapter as ExtendedChapter).videoUrl) {
          allS3Keys.push((chapter as ExtendedChapter).videoUrl!);
        }

        chapter.subchapters.forEach((subchapter) => {
          // Subchapter Materials
          if ((subchapter as ExtendedSubchapter).studyMaterialUrl) {
            allS3Keys.push(
              (subchapter as ExtendedSubchapter).studyMaterialUrl!,
            );
          }
          // Section Videos
          subchapter.sections?.forEach((section) => {
            if (section.videoUrl) {
              allS3Keys.push(section.videoUrl);
            }
          });
        });
      });

      if (allS3Keys.length === 0) return;

      try {
        setLoadingSignedUrls(true);
        const urlMap = await learningService.getSignedUrlsBatch(allS3Keys);
        const now = Date.now();
        const timestamps = new Map<string, number>();
        allS3Keys.forEach((key) => {
          timestamps.set(key, now);
        });

        setSignedUrls(urlMap);
        setUrlTimestamps(timestamps);
      } catch (error) {
        console.error("Error fetching signed URLs:", error);
      } finally {
        setLoadingSignedUrls(false);
      }
    };

    fetchSignedUrls();
  }, [courseStructure]);

  // 3. Auto-refresh signed URLs every 8 minutes
  useEffect(() => {
    const refreshInterval = setInterval(
      async () => {
        const allKeys = Array.from(signedUrls.keys());
        if (allKeys.length > 0) {
          try {
            const urlMap = await learningService.getSignedUrlsBatch(allKeys);
            setSignedUrls(urlMap);
            setUrlTimestamps(new Map(allKeys.map((key) => [key, Date.now()])));
          } catch (error) {
            console.error("Error refreshing signed URLs:", error);
          }
        }
      },
      8 * 60 * 1000,
    );
    return () => clearInterval(refreshInterval);
  }, [signedUrls]);

  // --- Realtime Progress Calc ---
  useEffect(() => {
    if (!courseStructure) return;
    let total = 0;
    let completed = 0;
    courseStructure.chapters.forEach((ch, cIdx) => {
      ch.subchapters.forEach((sub, sIdx) => {
        sub.sections.forEach((_, secIdx) => {
          total++;
          if (completedSections.has(`${cIdx}-${sIdx}-${secIdx}`)) completed++;
        });
        if (sub.quiz) {
          total++;
          const qId = typeof sub.quiz === "string" ? sub.quiz : sub.quiz._id;
          if (completedQuizzes.has(qId)) completed++;
        }
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    setProgress(percent);
    if (percent === 100 && !isCompleted) {
      setIsCompleted(true);
      confetti();
      toast.success("Course Completed!");
    }
  }, [completedSections, completedQuizzes]);

  // --- Logic Helpers ---
  const isSubchapterUnlocked = useCallback(
    (cIdx: number, sIdx: number) => {
      // 1. First subchapter is always unlocked
      if (cIdx === 0 && sIdx === 0) return true;

      // 2. If we have a current pointer, check strictly against it
      if (currentSubchapter && courseStructure) {
        let reachedCurrent = false;

        // Iterate to see if we satisfy the order
        for (let i = 0; i < courseStructure.chapters.length; i++) {
          const chapter = courseStructure.chapters[i];
          for (let j = 0; j < chapter.subchapters.length; j++) {
            const sub = chapter.subchapters[j];

            // If this is the subchapter we are checking
            if (i === cIdx && j === sIdx) {
              // If we haven't reached the users current position yet, then this one is definitely unlocked (it's behind)
              // If we HAVE reached it (matched), then it is also unlocked (current one is unlocked)
              return !reachedCurrent || sub._id === currentSubchapter;
            }

            // If we found the user's current position, mark it
            if (sub._id === currentSubchapter) {
              reachedCurrent = true;
            }

            // Optimization: If we passed the user's current position, and haven't found the target yet (checked above),
            // then the target is definitely locked.
            if (reachedCurrent && (i > cIdx || (i === cIdx && j > sIdx))) {
              return false;
            }
          }
        }
      }

      return false;
    },
    [courseStructure, currentSubchapter],
  );

  const isSectionAccessible = useCallback(
    (cIdx: number, sIdx: number, secIdx: number) => {
      if (!isSubchapterUnlocked(cIdx, sIdx)) return false;
      if (secIdx > 0) {
        return completedSections.has(`${cIdx}-${sIdx}-${secIdx - 1}`);
      }
      return true;
    },
    [isSubchapterUnlocked, completedSections],
  );

  const toggleChapter = (id: string) =>
    setExpandedChapters((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  const toggleSubchapter = (id: string) =>
    setExpandedSubchapters((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const handleSelectSection = (cIdx: number, sIdx: number, secIdx: number) => {
    if (!isSectionAccessible(cIdx, sIdx, secIdx)) {
      toast.error("Section Locked");
      return;
    }
    const sec =
      courseStructure!.chapters[cIdx].subchapters[sIdx].sections[secIdx];
    setSelectedSection({
      chapterIndex: cIdx,
      subchapterIndex: sIdx,
      sectionIndex: secIdx,
      title: sec.title,
      content: sec.generatedContent || "",
      videoUrl: sec.videoUrl,
    });

    // Mark Complete
    const secId = `${cIdx}-${sIdx}-${secIdx}`;
    if (!completedSections.has(secId)) {
      const newSet = new Set(completedSections);
      newSet.add(secId);
      setCompletedSections(newSet);
      updateCourseProgress(id!, {
        currentLesson: 0,
        completedSections: Array.from(newSet),
      }).catch(console.error);
    }
  };

  // --- TAB RENDERERS ---

  // 1. CONTENT TAB
  const renderContentTab = () => {
    if (!selectedSection)
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-[#8A63FF]" />
            <h2 className="text-xl font-bold text-gray-900">Course Overview</h2>
          </div>
          <p className="text-sm text-gray-500">
            Select a section from below or from the sidebar to start learning.
          </p>

          <Accordion
            type="multiple"
            className="w-full space-y-3"
            defaultValue={courseStructure?.chapters.map((c) => c._id)}
          >
            {courseStructure?.chapters.map((chapter: ExtendedChapter, cIdx) => {
              const isChapterUnlocked =
                cIdx === 0 ||
                unlockedSubchapters.has(
                  courseStructure.chapters[cIdx].subchapters[0]?._id,
                );

              return (
                <AccordionItem
                  key={chapter._id}
                  value={chapter._id}
                  className="border rounded-lg bg-white overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#8A63FF] text-white h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {cIdx + 1}
                      </span>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 text-sm">
                          {chapter.title}
                        </span>
                        {chapter.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                      {!isChapterUnlocked && (
                        <Lock className="h-4 w-4 text-gray-400 ml-auto mr-2" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {chapter.subchapters.map(
                        (sub: ExtendedSubchapter, sIdx) => {
                          const isSubUnlocked =
                            cIdx === 0 && sIdx === 0
                              ? true
                              : unlockedSubchapters.has(sub._id);
                          const quizId = sub.quiz
                            ? typeof sub.quiz === "string"
                              ? sub.quiz
                              : sub.quiz._id
                            : null;
                          const quizPassed = quizId
                            ? completedQuizzes.has(quizId)
                            : false;

                          return (
                            <div
                              key={sub._id}
                              className={`flex items-center justify-between px-4 py-3 ${
                                isSubUnlocked
                                  ? "hover:bg-purple-50 cursor-pointer"
                                  : "opacity-60"
                              }`}
                              onClick={() => {
                                if (isSubUnlocked && sub.sections?.length > 0) {
                                  handleSelectSection(cIdx, sIdx, 0);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded min-w-[2rem] text-center">
                                  {cIdx + 1}.{sIdx + 1}
                                </span>
                                <div>
                                  <p
                                    className={`text-sm font-medium ${isSubUnlocked ? "text-gray-800" : "text-gray-500"}`}
                                  >
                                    {sub.title}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {sub.sections?.length || 0} sections
                                    {sub.quiz && " • Has Quiz"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {quizPassed && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    ✓ Passed
                                  </span>
                                )}
                                {isSubUnlocked ? (
                                  <ArrowRight className="h-4 w-4 text-[#8A63FF]" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      );

    const videoSrc = selectedSection.videoUrl
      ? signedUrls.get(selectedSection.videoUrl) ||
        getEmbedUrl(selectedSection.videoUrl)
      : null;

    return (
      <div className="space-y-4">
        {selectedSection.videoUrl && (
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            {videoSrc?.includes("drive.google") ? (
              <iframe
                src={videoSrc}
                className="w-full h-full"
                allowFullScreen
                title={selectedSection.title}
              />
            ) : (
              <video
                src={videoSrc || ""}
                controls
                className="w-full h-full"
                controlsList="nodownload"
              />
            )}
          </div>
        )}
        <div className="prose max-w-none p-4 bg-white rounded-lg border">
          <ReactMarkdown>{selectedSection.content}</ReactMarkdown>
        </div>

        {/* QUIZ BUTTON IN CONTENT AREA */}
        {(() => {
          const currSub =
            courseStructure?.chapters[selectedSection.chapterIndex]
              ?.subchapters[selectedSection.subchapterIndex];
          const isLastSec =
            currSub &&
            selectedSection.sectionIndex === currSub.sections.length - 1;

          if (isLastSec && currSub?.quiz) {
            const quizId =
              typeof currSub.quiz === "string"
                ? currSub.quiz
                : currSub.quiz._id;
            const isPassed = completedQuizzes.has(quizId);

            return (
              <div className="flex justify-end mt-4">
                {isPassed ? (
                  <Button
                    disabled
                    className="bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
                  >
                    <Trophy className="mr-2 h-4 w-4" /> Quiz Passed
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      navigate(`/course/${id}/quiz/${currSub._id}`)
                    }
                    className="bg-[#8A63FF] hover:bg-[#7a52e6] text-white"
                  >
                    <FileQuestion className="mr-2 h-4 w-4" />
                    Take Quiz: {currSub.quiz.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          }
        })()}
      </div>
    );
  };

  // 2. VIDEOS TAB (Render ALL Chapters)
  const renderVideosTab = () => {
    return (
      <div className="space-y-8">
        {courseStructure?.chapters.map((chapter: ExtendedChapter, index) => {
          const videoSrc = chapter.videoUrl
            ? signedUrls.get(chapter.videoUrl) || getEmbedUrl(chapter.videoUrl)
            : null;

          return (
            <div key={chapter._id} className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">
                  Chapter {index + 1}
                </span>
                {chapter.title}
              </h3>

              {chapter.videoUrl ? (
                <div className="rounded-xl overflow-hidden bg-black shadow-sm border border-gray-200">
                  {videoSrc?.includes("drive.google") ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={videoSrc}
                        className="w-full h-full"
                        allowFullScreen
                        title={chapter.title}
                      />
                    </div>
                  ) : (
                    <video
                      src={videoSrc || ""}
                      controls
                      className="w-full h-auto aspect-video"
                      controlsList="nodownload"
                      preload="metadata"
                    />
                  )}
                  <div className="p-4 bg-white border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900">
                      {chapter.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">Video Lecture</p>
                  </div>
                </div>
              ) : (
                <Card className="bg-gray-50 border-dashed border-gray-300">
                  <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                    <div className="bg-gray-100 p-3 rounded-full mb-2">
                      <Video className="h-8 w-8 text-gray-300" />
                    </div>
                    <span className="text-sm font-medium">
                      No Video Available
                    </span>
                    <span className="text-xs">
                      This chapter does not have a video lecture yet.
                    </span>
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 3. STUDY MATERIALS TAB (Render ALL Chapters/Subchapters)
  const renderMaterialsTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
          <ShieldAlert className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">
              Secure Reading Mode
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              Study materials are protected. Copying and screenshots are
              disabled.
            </p>
          </div>
        </div>

        <Accordion
          type="multiple"
          className="w-full space-y-4"
          defaultValue={courseStructure?.chapters.map((c) => c._id)}
        >
          {courseStructure?.chapters.map((chapter, index) => (
            <AccordionItem
              key={chapter._id}
              value={chapter._id}
              className="border rounded-lg bg-white px-0 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
                <span className="font-medium text-gray-900">
                  Chapter {index + 1}: {chapter.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                {chapter.subchapters.length > 0 ? (
                  chapter.subchapters.map((sub: ExtendedSubchapter, sIdx) => {
                    const materialUrl = sub.studyMaterialUrl
                      ? signedUrls.get(sub.studyMaterialUrl) ||
                        sub.studyMaterialUrl
                      : null;

                    return (
                      <div
                        key={sub._id}
                        className="flex items-center justify-between p-4 border-t border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded ${sub.studyMaterialUrl ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}
                          >
                            {sub.studyMaterialUrl ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <FileX className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h5
                              className={`font-medium text-sm ${sub.studyMaterialUrl ? "text-gray-800" : "text-gray-400"}`}
                            >
                              {sub.title}
                            </h5>
                            <p className="text-xs text-gray-500">
                              {sub.studyMaterialUrl
                                ? "Secure Document"
                                : "No material uploaded"}
                            </p>
                          </div>
                        </div>
                        {sub.studyMaterialUrl ? (
                          <Button
                            size="sm"
                            className="gap-2 bg-gray-900 text-white hover:bg-black"
                            onClick={() =>
                              setActiveDoc({
                                url: materialUrl!,
                                title: sub.title,
                              })
                            }
                          >
                            <Maximize2 className="h-3 w-3" /> Read
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled
                            className="text-gray-400"
                          >
                            Unavailable
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400 italic">
                    No modules in this chapter.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  // 4. ASSIGNMENTS TAB (Real Data)
  const renderAssignmentsTab = () => {
    if (!assignments || assignments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">
            No Assignments Yet
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1">
            Assignments will appear here as you progress through the course
            content.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="h-6 w-6 text-[#8A63FF]" />
          <h2 className="text-xl font-bold text-gray-900">
            Chapter Assignments
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          Each chapter has one assignment. Complete the tasks to deepen your
          understanding.
        </p>

        <div className="space-y-4">
          {assignments.map((assignment, aIdx) => {
            const diffColor =
              assignment.difficulty === "Easy"
                ? "bg-green-100 text-green-700"
                : assignment.difficulty === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700";

            const isSubmitted =
              assignment.status === "submitted" ||
              assignment.status === "graded";
            const isSubmitting = submittingIds.includes(assignment._id);

            return (
              <div
                key={assignment._id}
                className="border rounded-xl bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#8A63FF] text-white h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {aIdx + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {assignment.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Chapter{" "}
                          {assignment.chapterId
                            ? assignment.chapterTitle
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSubmitted && (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          Submitted
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`${diffColor} border-0 text-xs font-medium`}
                      >
                        {assignment.difficulty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-0 text-xs font-medium"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {assignment.estimatedDuration}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {assignment.description}
                  </p>

                  {/* Tasks */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-[#8A63FF]" />
                      Tasks to Complete
                    </h4>
                    {assignment.tasks &&
                      assignment.tasks.map((task: string, tIdx: number) => (
                        <div
                          key={tIdx}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="bg-white border border-gray-200 text-gray-500 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {tIdx + 1}
                          </span>
                          <p className="text-sm text-gray-700">{task}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Submit Link */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  {isSubmitted ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Submission
                      </div>
                      <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                        <a
                          href={assignment.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#8A63FF] hover:underline truncate max-w-[300px]"
                        >
                          {assignment.submissionLink}
                        </a>
                        <span className="text-xs text-gray-400">
                          {new Date(
                            assignment.submittedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {assignment.grade && (
                        <div className="bg-green-50 p-3 rounded-md border border-green-100 mt-2">
                          <p className="text-sm text-green-800 font-medium">
                            Grade: {assignment.grade}
                          </p>
                          {assignment.feedback && (
                            <p className="text-xs text-green-700 mt-1">
                              {assignment.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-end gap-3 transition-opacity">
                      <div className="flex-1 space-y-1.5">
                        <label
                          htmlFor={`link-${assignment._id}`}
                          className="text-xs font-medium text-gray-700 ml-1"
                        >
                          Submission Link (Google Drive, GitHub, etc.)
                        </label>
                        <Input
                          id={`link-${assignment._id}`}
                          placeholder="https://..."
                          value={submissionLinks[assignment._id] || ""}
                          onChange={(e) =>
                            handleLinkChange(assignment._id, e.target.value)
                          }
                          className="bg-white"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        onClick={() =>
                          handleSubmitAssignment(
                            assignment._id,
                            assignment.chapterId,
                          )
                        }
                        disabled={
                          !submissionLinks[assignment._id] || isSubmitting
                        }
                        className="bg-[#8A63FF] hover:bg-[#7a52e6] text-white min-w-[100px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Spinner className="h-12 w-12 text-[#8A63FF] mb-4" />
          <span className="text-gray-600 font-medium">
            Loading course content...
          </span>
        </div>
      </div>
    );

  if (error || !course)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 gap-4">
        <Ban className="h-12 w-12" />
        <span className="text-xl font-semibold">Course Not Found</span>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Secure Viewer */}
      {activeDoc && (
        <SecureDocViewer
          url={activeDoc.url}
          title={activeDoc.title}
          userId="Student"
          onClose={() => setActiveDoc(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/course")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Tabs */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-6 bg-white border h-auto p-1">
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-purple-50 data-[state=active]:text-[#8A63FF] py-3"
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Content
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="data-[state=active]:bg-purple-50 data-[state=active]:text-[#8A63FF] py-3"
                >
                  <Video className="h-4 w-4 mr-2" /> Videos
                </TabsTrigger>
                <TabsTrigger
                  value="materials"
                  className="data-[state=active]:bg-purple-50 data-[state=active]:text-[#8A63FF] py-3"
                >
                  <FileText className="h-4 w-4 mr-2" /> Materials
                </TabsTrigger>
                <TabsTrigger
                  value="assignments"
                  className="data-[state=active]:bg-purple-50 data-[state=active]:text-[#8A63FF] py-3"
                >
                  <ClipboardList className="h-4 w-4 mr-2" /> Assignments
                </TabsTrigger>
              </TabsList>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                <TabsContent value="content" className="mt-0">
                  {renderContentTab()}
                </TabsContent>
                <TabsContent value="videos" className="mt-0">
                  {renderVideosTab()}
                </TabsContent>
                <TabsContent value="materials" className="mt-0">
                  {renderMaterialsTab()}
                </TabsContent>
                <TabsContent value="assignments" className="mt-0">
                  {renderAssignmentsTab()}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* RIGHT: Sidebar (Original Quiz Logic Restored) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 max-h-[calc(100vh-100px)] flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle>Course Progress</CardTitle>
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>{progress}% Completed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent className="flex-1 overflow-scroll p-0">
                <ScrollArea className="h-full px-4 pb-4">
                  <div className="space-y-4 mt-2">
                    {courseStructure?.chapters.map((chapter, cIdx) => {
                      const isUnlocked =
                        cIdx === 0 ||
                        unlockedSubchapters.has(
                          courseStructure.chapters[cIdx].subchapters[0]?._id,
                        );
                      const isExpanded = expandedChapters.includes(chapter._id);

                      return (
                        <div
                          key={chapter._id}
                          className="border rounded-lg overflow-hidden bg-white"
                        >
                          <div
                            className={`flex items-center justify-between p-3 cursor-pointer ${isUnlocked ? "hover:bg-gray-50" : "bg-gray-100"}`}
                            onClick={() =>
                              isUnlocked && toggleChapter(chapter._id)
                            }
                          >
                            <div className="flex items-center gap-2">
                              {isUnlocked ? (
                                <BookOpen className="h-4 w-4 text-[#8A63FF]" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                              <span
                                className={`font-medium text-sm ${isUnlocked ? "text-gray-900" : "text-gray-500"}`}
                              >
                                {chapter.title}
                              </span>
                            </div>
                            {isUnlocked &&
                              (isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              ))}
                          </div>

                          {isExpanded && isUnlocked && (
                            <div className="border-t">
                              {chapter.subchapters.map((sub, sIdx) => {
                                const isSubUnlocked = isSubchapterUnlocked(
                                  cIdx,
                                  sIdx,
                                );
                                const isSubExpanded =
                                  expandedSubchapters.includes(sub._id);

                                return (
                                  <div
                                    key={sub._id}
                                    className="border-b last:border-b-0"
                                  >
                                    <div
                                      className={`flex items-center justify-between p-2 pl-6 cursor-pointer ${isSubUnlocked ? "bg-gray-50/50 hover:bg-gray-100" : "bg-gray-50"}`}
                                      onClick={() =>
                                        isSubUnlocked &&
                                        toggleSubchapter(sub._id)
                                      }
                                    >
                                      <div className="flex items-center gap-2">
                                        {isSubUnlocked ? (
                                          <div className="w-2 h-2 rounded-full bg-[#8A63FF]" />
                                        ) : (
                                          <Lock className="h-3 w-3 text-gray-300" />
                                        )}
                                        <span
                                          className={`text-sm font-medium ${isSubUnlocked ? "text-gray-800" : "text-gray-400"}`}
                                        >
                                          {sub.title}
                                        </span>
                                      </div>
                                      {isSubUnlocked &&
                                        (isSubExpanded ? (
                                          <ChevronDown className="h-3 w-3 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-gray-400" />
                                        ))}
                                    </div>

                                    {isSubExpanded && isSubUnlocked && (
                                      <div className="bg-white">
                                        {sub.sections.map((sec, secIdx) => {
                                          const secId = `${cIdx}-${sIdx}-${secIdx}`;
                                          const isSecDone =
                                            completedSections.has(secId);
                                          const isSecUnlocked =
                                            isSectionAccessible(
                                              cIdx,
                                              sIdx,
                                              secIdx,
                                            );
                                          return (
                                            <div
                                              key={sec._id}
                                              className={`flex items-center justify-between py-2 px-3 pl-10 border-l-2 ml-4 mb-1 ${selectedSection?.title === sec.title ? "border-[#8A63FF] bg-purple-50" : "border-transparent"} ${isSecUnlocked ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed opacity-60"}`}
                                              onClick={() =>
                                                isSecUnlocked &&
                                                handleSelectSection(
                                                  cIdx,
                                                  sIdx,
                                                  secIdx,
                                                )
                                              }
                                            >
                                              <div className="flex items-center gap-2 overflow-hidden">
                                                {isSecDone ? (
                                                  <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                                ) : (
                                                  <div className="h-3 w-3 border rounded-full border-gray-300 shrink-0" />
                                                )}
                                                <span className="text-sm truncate">
                                                  {sec.title}
                                                </span>
                                              </div>
                                              {isSecUnlocked && (
                                                <Eye className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                                              )}
                                            </div>
                                          );
                                        })}

                                        {/* --- QUIZ LOGIC RESTORED --- */}
                                        {sub.quiz &&
                                          (() => {
                                            const quizId =
                                              typeof sub.quiz === "string"
                                                ? sub.quiz
                                                : sub.quiz._id;
                                            const passed =
                                              completedQuizzes.has(quizId);
                                            const score = quizScores[quizId];
                                            const lastSecId = `${cIdx}-${sIdx}-${sub.sections.length - 1}`;
                                            const quizUnlocked =
                                              completedSections.has(
                                                lastSecId,
                                              ) || sub.sections.length === 0;

                                            return (
                                              <div
                                                className={`mx-4 mb-2 mt-1 p-2 rounded border flex items-center justify-between ${
                                                  quizUnlocked
                                                    ? passed
                                                      ? "bg-green-50 border-green-200 cursor-default"
                                                      : "bg-purple-50 border-purple-200 cursor-pointer"
                                                    : "bg-gray-100 opacity-60"
                                                }`}
                                                onClick={() => {
                                                  if (passed) {
                                                    toast.info(
                                                      "Test already taken.",
                                                    );
                                                    return;
                                                  }
                                                  if (quizUnlocked)
                                                    navigate(
                                                      `/course/${id}/quiz/${sub._id}`,
                                                    );
                                                }}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <FileQuestion
                                                    className={`h-4 w-4 ${passed ? "text-green-600" : "text-[#8A63FF]"}`}
                                                  />
                                                  <span className="text-sm font-medium">
                                                    {passed
                                                      ? "Test Taken"
                                                      : "Quiz"}
                                                  </span>
                                                </div>
                                                {passed ? (
                                                  <Badge
                                                    variant="outline"
                                                    className="bg-green-100 text-green-700 border-green-200"
                                                  >
                                                    {score}%
                                                  </Badge>
                                                ) : quizUnlocked ? (
                                                  <ArrowRight className="h-3 w-3 text-purple-400" />
                                                ) : (
                                                  <Lock className="h-3 w-3 text-gray-400" />
                                                )}
                                              </div>
                                            );
                                          })()}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningModule;

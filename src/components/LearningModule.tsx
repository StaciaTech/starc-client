/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
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
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  ArrowLeft,
  Ban,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import courseStructureService, {
  CourseStructure,
} from "@/services/courseStructureService";
import quizService from "@/services/quizService";
import learningService from "@/services/learningService";
import { confetti } from "@/lib/confetti";
import { ExtendedChapter, ExtendedSubchapter } from "@/types/learning";

// Sub-components
import SecureDocViewer from "./LearningModule/Security/SecureDocViewer";
import AssignmentsTab from "./LearningModule/Tabs/AssignmentsTab";
import ContentTab from "./LearningModule/Tabs/ContentTab";
import MaterialsTab from "./LearningModule/Tabs/MaterialsTab";
import VideosTab from "./LearningModule/Tabs/VideosTab";
import CourseSidebar from "./LearningModule/Sidebar/CourseSidebar";

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
  // State for Quiz Stats
  const [quizStats, setQuizStats] = useState<{
    [quizId: string]: {
      score: number;
      attempts: number;
      passed: boolean;
    };
  }>({});
  const [unlockedSubchapters, setUnlockedSubchapters] = useState<Set<string>>(
    new Set(),
  );
  const [currentSubchapter, setCurrentSubchapter] = useState<string | null>(
    null,
  );

  // Signed URL State for secure S3 access
  const [signedUrls, setSignedUrls] = useState<Map<string, string>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [urlTimestamps, setUrlTimestamps] = useState<Map<string, number>>(
    new Map(),
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const {
    courseId = "",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chapterId = "",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    subchapterId = "",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sectionId = "",
  } = useParams<{
    courseId: string;
    chapterId: string;
    subchapterId: string;
    sectionId: string;
  }>();

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

        // ... (inside fetchData useEffect) ...
        // --- Process Quizzes ---
        const completedQ = new Set<string>();
        const stats: {
          [id: string]: { score: number; attempts: number; passed: boolean };
        } = {};

        // Count attempts per quiz
        const attemptCounts: { [id: string]: number } = {};
        attempts.forEach((att: any) => {
          const qId = att.quiz?._id || att.quiz;
          attemptCounts[qId] = (attemptCounts[qId] || 0) + 1;
        });

        attempts.forEach((att: any) => {
          const qId = att.quiz?._id || att.quiz;
          const currentMax = stats[qId]?.score || 0;
          stats[qId] = {
            score: Math.max(currentMax, att.percentage || 0),
            attempts: attemptCounts[qId] || 0,
            passed: stats[qId]?.passed || att.passed,
          };
          if (att.passed) completedQ.add(qId);
        });
        setCompletedQuizzes(completedQ);
        setQuizScores(
          Object.fromEntries(
            Object.entries(stats).map(([k, v]) => [k, v.score]),
          ),
        );
        setQuizStats(stats);

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
      // 1. Time-based Check: Content unlocks 1 week before the assignment (Week 0, 2, 4...)
      // Chapter 1: Week 0
      // Chapter 2: Week 2
      if (courseStartDate) {
        const weeksToUnlock = 2 * cIdx; // 0, 2, 4, 6...
        const unlockDate = new Date(courseStartDate);
        unlockDate.setDate(unlockDate.getDate() + weeksToUnlock * 7);
        // Set to beginning of the day to avoid hour mismatches
        unlockDate.setHours(0, 0, 0, 0);

        const today = new Date();
        if (today < unlockDate) return false;
      }

      // ------------------------------------------
      // 2. Intra-Chapter Sequential Logic
      // ------------------------------------------

      // If it's the very first subchapter of the entire course, it's open (if time permits)
      if (cIdx === 0 && sIdx === 0) return true;

      // Identify "Previous" Subchapter
      let prevCIdx = cIdx;
      let prevSIdx = sIdx - 1;

      // If we are at start of a chapter (e.g. 2.1), look at end of previous chapter (1.Last)
      if (prevSIdx < 0) {
        prevCIdx = cIdx - 1;
        if (!courseStructure || !courseStructure.chapters[prevCIdx])
          return false;
        prevSIdx = courseStructure.chapters[prevCIdx].subchapters.length - 1;
      }

      // Helper to check if a specific subchapter is "Done"
      // Done = (No Quiz OR (Quiz Passed OR Attempts >= 3))
      const isSubchapterDone = (checkCIdx: number, checkSIdx: number) => {
        if (!courseStructure) return false;
        const sub = courseStructure.chapters[checkCIdx].subchapters[checkSIdx];

        // If it has a quiz, we must match condition
        if (sub.quiz) {
          const quizId = typeof sub.quiz === "string" ? sub.quiz : sub.quiz._id;
          const stat = quizStats[quizId];
          if (stat) {
            if (stat.passed) return true;
            if (stat.attempts >= 3) return true; // Fail forward
          }
          return false; // Quiz exists but not passed/maxed
        }

        // If no quiz, check sections
        if (sub.sections && sub.sections.length > 0) {
          const lastSecIdx = sub.sections.length - 1;
          return completedSections.has(
            `${checkCIdx}-${checkSIdx}-${lastSecIdx}`,
          );
        }

        return true;
      };

      return isSubchapterDone(prevCIdx, prevSIdx);
    },
    [
      courseStructure,
      currentSubchapter,
      courseStartDate,
      quizStats,
      completedSections,
      completedQuizzes,
    ],
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

  const handleNavigateToQuiz = (quizId: string, subchapterId: string) => {
    navigate(`/course/${id}/quiz/${subchapterId}`);
  };

  const handleViewDocument = (url: string, title: string) => {
    setActiveDoc({ url, title });
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
                  <ContentTab
                    courseStructure={courseStructure}
                    unlockedSubchapters={unlockedSubchapters}
                    completedQuizzes={completedQuizzes}
                    completedSections={completedSections}
                    selectedSection={selectedSection}
                    signedUrls={signedUrls}
                    onSelectSection={handleSelectSection}
                    onTakeQuiz={handleNavigateToQuiz}
                  />
                </TabsContent>
                <TabsContent value="videos" className="mt-0">
                  <VideosTab
                    courseStructure={courseStructure}
                    signedUrls={signedUrls}
                  />
                </TabsContent>
                <TabsContent value="materials" className="mt-0">
                  <MaterialsTab
                    courseStructure={courseStructure}
                    signedUrls={signedUrls}
                    onViewDocument={handleViewDocument}
                  />
                </TabsContent>
                <TabsContent value="assignments" className="mt-0">
                  <AssignmentsTab
                    courseId={courseId || id || ""}
                    courseStructure={courseStructure}
                    courseStartDate={courseStartDate}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-1">
            <CourseSidebar
              courseStructure={courseStructure}
              progress={progress}
              unlockedSubchapters={unlockedSubchapters}
              expandedChapters={expandedChapters}
              toggleChapter={toggleChapter}
              expandedSubchapters={expandedSubchapters}
              toggleSubchapter={toggleSubchapter}
              completedSections={completedSections}
              completedQuizzes={completedQuizzes}
              quizScores={quizScores}
              selectedSection={selectedSection}
              isSubchapterUnlocked={isSubchapterUnlocked}
              isSectionAccessible={isSectionAccessible}
              onSelectSection={handleSelectSection}
              onNavigateToQuiz={handleNavigateToQuiz}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningModule;

/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getCourseById, ICourse } from '@/services/courseService';
import { getUserCourseDetails, updateCourseProgress } from '@/services/profileService';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { confetti } from '@/lib/confetti';
import courseStructureService, { CourseStructure, Chapter, Subchapter, Section } from '@/services/courseStructureService';
import { ChevronDown, ChevronRight, BookOpen, FileQuestion, ArrowLeft, CheckCircle2, Lock, Eye, BookMarked, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import quizService from '@/services/quizService';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import StudyMaterialsList from './StudyMaterialsList';

const LearningModule: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for course data
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for learning module UI
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('structure');
  
  // Course structure data
  const [courseStructure, setCourseStructure] = useState<CourseStructure | null>(null);
  const [loadingStructure, setLoadingStructure] = useState<boolean>(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [expandedSubchapters, setExpandedSubchapters] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<{
    chapterIndex: number;
    subchapterIndex: number;
    sectionIndex: number;
    title: string;
    content: string;
    videoUrl?: string;
  } | null>(null);
  
  // Completed sections and quizzes tracking
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const [quizzesBySubchapter, setQuizzesBySubchapter] = useState<{[key: string]: any[]}>({});
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(false);
  const [quizScores, setQuizScores] = useState<{[quizId: string]: number}>({});

  // Modal state for viewing section content
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedSectionTitle, setSelectedSectionTitle] = useState('');
  const [selectedSectionContent, setSelectedSectionContent] = useState<string | undefined>('');
  const [loadingContent, setLoadingContent] = useState(false);

  // Fetch course data
  useEffect(() => {
  if (id) {
    fetchCourseData();
    refreshQuizProgress(); // Correct function name
  }
}, [id]);

  // Handle course completion state
  useEffect(() => {
    if (progress === 100 && !isCompleted && course?.isCompleted) {
      setIsCompleted(true);
      toast.success("Congratulations! You've completed this course!");
      confetti();
    }
  }, [progress, course?.isCompleted]);

  // Refresh quiz progress
  const refreshQuizProgress = async () => {
    if (!id) return;
    try {
      setLoadingQuizzes(true);
      console.log("Fetching quizzes for course:", id);
      const quizzes = await quizService.getQuizzesByCourse(id);
      console.log("Quizzes fetched:", quizzes);
      
      if (!quizzes || quizzes.length === 0) {
        console.log("No quizzes found for this course");
        setQuizzesBySubchapter({});
        setLoadingQuizzes(false);
        return;
      }

      const quizzesBySubchapterMap: {[key: string]: any[]} = {};
      if (courseStructure) {
        courseStructure.chapters.forEach(chapter => {
          chapter.subchapters.forEach(subchapter => {
            quizzesBySubchapterMap[subchapter.title] = [];
          });
        });
      }

      quizzes.forEach((quiz: any) => {
        let subchapterName = quiz.subchapter || quiz.title.split(':')[0]?.trim() || 
          (courseStructure?.chapters[0]?.subchapters[0]?.title) || 'Unknown';
        if (!quizzesBySubchapterMap[subchapterName]) {
          quizzesBySubchapterMap[subchapterName] = [];
        }
        quizzesBySubchapterMap[subchapterName].push(quiz);
      });
      console.log("Quizzes by subchapter:", quizzesBySubchapterMap);
      setQuizzesBySubchapter(quizzesBySubchapterMap);

      const attempts = await quizService.getUserQuizAttempts(id);
      console.log("User quiz attempts:", attempts);
      
      const completedQuizzesSet = new Set<string>();
      const quizScoresMap: {[quizId: string]: number} = {};

      attempts.forEach((attempt: any) => {
        const quizId = attempt.quiz?._id || attempt.quiz || attempt.quizId;
        if (quizId) {
          const percentage = attempt.percentage || 0;
          quizScoresMap[quizId] = Math.max(quizScoresMap[quizId] || 0, percentage);
          if (attempt.passed && percentage >= 70) {
            completedQuizzesSet.add(quizId);
          }
        } else {
          console.warn("Invalid quiz attempt data:", attempt);
        }
      });

      console.log("Completed quizzes:", Array.from(completedQuizzesSet));
      console.log("Quiz scores:", quizScoresMap);
      setCompletedQuizzes(completedQuizzesSet);
      setQuizScores(quizScoresMap);
      setLoadingQuizzes(false);

      // Recalculate progress after updating quiz status
      const newProgress = calculateOverallProgress(courseStructure, Array.from(completedSections), Array.from(completedQuizzes));
      console.log("Recalculated overall progress:", newProgress);
      setProgress(newProgress);
    } catch (error) {
      console.error("Error fetching quiz progress:", error);
      setLoadingQuizzes(false);
    }
  };

  // Handle window focus for quiz progress refresh
  useEffect(() => {
    if (!id) return;
    const handleFocus = () => {
      console.log('Window focused, refreshing quiz attempts');
      refreshQuizProgress();
    };
    window.addEventListener('focus', handleFocus);
    refreshQuizProgress();
    return () => window.removeEventListener('focus', handleFocus);
  }, [id]);

  const fetchCourseData = async () => {
    if (!id) {
      setError('Course ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const courseData = await getCourseById(id);
      if (!courseData) {
        setError('Course not found');
        setLoading(false);
        return;
      }
      setCourse(courseData);

      if (courseData.isCompleted) {
        toast.info(
          <div className="flex flex-col gap-1">
            <p className="font-semibold">This course has been marked as completed</p>
            {courseData.completionAnnouncement && (
              <p className="text-sm">{courseData.completionAnnouncement}</p>
            )}
          </div>,
          { duration: 6000 }
        );
      }

      try {
        setLoadingStructure(true);
        const structureData = await courseStructureService.getCourseStructure(id);
        setCourseStructure(structureData);
        if (structureData?.chapters?.length > 0) {
          setExpandedChapters([structureData.chapters[0].id]);
          if (structureData.chapters[0].subchapters?.length > 0) {
            setExpandedSubchapters([structureData.chapters[0].subchapters[0].id]);
            if (structureData.chapters[0].subchapters[0].sections?.length > 0) {
              const firstSection = structureData.chapters[0].subchapters[0].sections[0];
              setSelectedSection({
                chapterIndex: 0,
                subchapterIndex: 0,
                sectionIndex: 0,
                title: firstSection.title,
                content: firstSection.generatedContent || 'No content available for this section.',
                videoUrl: firstSection.videoUrl
              });
            }
          }
        }
        setLoadingStructure(false);
      } catch (structureError) {
        console.error("Error fetching course structure:", structureError);
        setLoadingStructure(false);
      }

      try {
        const userCourseDetails = await getUserCourseDetails(id);
        if (userCourseDetails) {
          const userProgress = calculateOverallProgress(structureData, userCourseDetails.completedSections || [], userCourseDetails.completedQuizzes || []);
          console.log("Initial overall progress:", userProgress);
          setProgress(userProgress);
          setIsCompleted(userCourseDetails.completed || false);
          if (userProgress > 0 && userProgress < 100 && userCourseDetails.currentLesson !== undefined) {
            setCurrentLessonIndex(userCourseDetails.currentLesson);
          }
          if (userCourseDetails.completedSections?.length > 0) {
            setCompletedSections(new Set(userCourseDetails.completedSections));
          }
          if (userCourseDetails.completedQuizzes?.length > 0) {
            const completedQuizzesSet = new Set<string>();
            const quizScoresMap: {[quizId: string]: number} = {};
            userCourseDetails.completedQuizzes.forEach((quiz: any) => {
              if (quiz.passed) {
                completedQuizzesSet.add(quiz.quizId);
              }
              quizScoresMap[quiz.quizId] = quiz.score;
            });
            setCompletedQuizzes(completedQuizzesSet);
            setQuizScores(quizScoresMap);
          }
        }
      } catch (err) {
        console.error("Error fetching user progress:", err);
      }
    } catch (err: any) {
      console.error('Error fetching course:', err);
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall progress considering sections and quizzes
  const calculateOverallProgress = (structure: CourseStructure | null, completedSections: string[], completedQuizzes: string[]): number => {
    if (!structure) return 0;

    let totalItems = 0;
    let completedItems = 0;

    structure.chapters.forEach((chapter, chapterIndex) => {
      chapter.subchapters.forEach((subchapter, subchapterIndex) => {
        // Count sections
        totalItems += subchapter.sections.length;
        subchapter.sections.forEach((_, sectionIndex) => {
          const sectionId = `${chapterIndex}-${subchapterIndex}-${sectionIndex}`;
          if (completedSections.includes(sectionId)) {
            completedItems++;
            console.log(`Section completed: ${sectionId}`);
          } else {
            console.log(`Section not completed: ${sectionId}`);
          }
        });

        // Count quizzes
        const subchapterQuizzes = quizzesBySubchapter[subchapter.title] || [];
        totalItems += subchapterQuizzes.length;
        subchapterQuizzes.forEach(quiz => {
          if (completedQuizzes.includes(quiz._id) && quizScores[quiz._id] >= 70) {
            completedItems++;
            console.log(`Quiz completed: ${quiz._id} (Score: ${quizScores[quiz._id]}%)`);
          } else {
            console.log(`Quiz not completed: ${quiz._id} (Score: ${quizScores[quiz._id] || 'Not attempted'})`);
          }
        });
      });
    });

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    console.log(`Overall progress: ${completedItems}/${totalItems} = ${progress}%`);
    return progress;
  };

  // Calculate progress for a chapter
  const calculateChapterProgress = (chapterIndex: number): number => {
    if (!courseStructure) return 0;
    
    const chapter = courseStructure.chapters[chapterIndex];
    if (!chapter) return 0;
    
    let totalItems = 0;
    let completedItems = 0;
    
    chapter.subchapters.forEach((subchapter, subchapterIndex) => {
      // Count sections
      totalItems += subchapter.sections.length;
      subchapter.sections.forEach((_, sectionIndex) => {
        const sectionId = `${chapterIndex}-${subchapterIndex}-${sectionIndex}`;
        if (completedSections.has(sectionId)) {
          completedItems++;
          console.log(`Chapter ${chapterIndex} Section completed: ${sectionId}`);
        } else {
          console.log(`Chapter ${chapterIndex} Section not completed: ${sectionId}`);
        }
      });

      // Count quizzes
      const subchapterQuizzes = quizzesBySubchapter[subchapter.title] || [];
      totalItems += subchapterQuizzes.length;
      subchapterQuizzes.forEach(quiz => {
        if (completedQuizzes.has(quiz._id) && quizScores[quiz._id] >= 70) {
          completedItems++;
          console.log(`Chapter ${chapterIndex} Quiz completed: ${quiz._id} (Score: ${quizScores[quiz._id]}%)`);
        } else {
          console.log(`Chapter ${chapterIndex} Quiz not completed: ${quiz._id} (Score: ${quizScores[quiz._id] || 'Not attempted'})`);
        }
      });
    });
    
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    console.log(`Chapter ${chapterIndex} progress: ${completedItems}/${totalItems} = ${progress}%`);
    return progress;
  };

  // Calculate progress for a subchapter
  const calculateSubchapterProgress = (chapterIndex: number, subchapterIndex: number): number => {
    if (!courseStructure) return 0;
    
    const subchapter = courseStructure.chapters[chapterIndex]?.subchapters[subchapterIndex];
    if (!subchapter) return 0;
    
    let totalItems = subchapter.sections.length;
    let completedItems = 0;
    
    subchapter.sections.forEach((_, sectionIndex) => {
      const sectionId = `${chapterIndex}-${subchapterIndex}-${sectionIndex}`;
      if (completedSections.has(sectionId)) {
        completedItems++;
        console.log(`Subchapter ${chapterIndex}.${subchapterIndex} Section completed: ${sectionId}`);
      } else {
        console.log(`Subchapter ${chapterIndex}.${subchapterIndex} Section not completed: ${sectionId}`);
      }
    });

    const subchapterQuizzes = quizzesBySubchapter[subchapter.title] || [];
    totalItems += subchapterQuizzes.length;
    subchapterQuizzes.forEach(quiz => {
      if (completedQuizzes.has(quiz._id) && quizScores[quiz._id] >= 70) {
        completedItems++;
        console.log(`Subchapter ${chapterIndex}.${subchapterIndex} Quiz completed: ${quiz._id} (Score: ${quizScores[quiz._id]}%)`);
      } else {
        console.log(`Subchapter ${chapterIndex}.${subchapterIndex} Quiz not completed: ${quiz._id} (Score: ${quizScores[quiz._id] || 'Not attempted'})`);
      }
    });
    
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    console.log(`Subchapter ${chapterIndex}.${subchapterIndex} progress: ${completedItems}/${totalItems} = ${progress}%`);
    return progress;
  };

  // Check if all quizzes for a subchapter are completed
  const hasCompletedAllSubchapterQuizzes = (subchapterTitle: string): boolean => {
    const subchapterQuizzes = quizzesBySubchapter[subchapterTitle] || [];
    if (subchapterQuizzes.length === 0) return true;
    const allCompleted = subchapterQuizzes.every(quiz => completedQuizzes.has(quiz._id) && quizScores[quiz._id] >= 70);
    console.log(`Subchapter ${subchapterTitle} quizzes completed: ${allCompleted} (Quizzes: ${subchapterQuizzes.length})`);
    return allCompleted;
  };

  // Update progress when a section is viewed
  const updateProgress = async (chapterIndex: number, subchapterIndex: number, sectionIndex: number) => {
    if (!courseStructure || !id) return;
    
    try {
      const sectionId = `${chapterIndex}-${subchapterIndex}-${sectionIndex}`;
      if (!completedSections.has(sectionId)) {
        const previousUnlockStates = {
          chapters: courseStructure.chapters.map((_, idx) => isChapterUnlocked(idx)),
          subchapters: courseStructure.chapters.map((chapter, chIdx) => 
            chapter.subchapters.map((_, subIdx) => isSubchapterUnlocked(chIdx, subIdx))
          ),
          sections: courseStructure.chapters.map((chapter, chIdx) => 
            chapter.subchapters.map((subchapter, subIdx) => 
              subchapter.sections.map((_, secIdx) => isSectionAccessible(chIdx, subIdx, secIdx))
            )
          )
        };

        const newCompletedSections = new Set(completedSections);
        newCompletedSections.add(sectionId);
        setCompletedSections(newCompletedSections);

        const newProgress = calculateOverallProgress(courseStructure, Array.from(newCompletedSections), Array.from(completedQuizzes));
        const isLastChapter = chapterIndex === courseStructure.chapters.length - 1;
        const isLastSubchapter = isLastChapter && 
          subchapterIndex === courseStructure.chapters[chapterIndex].subchapters.length - 1;
        const isLastSection = isLastSubchapter && 
          sectionIndex === courseStructure.chapters[chapterIndex].subchapters[subchapterIndex].sections.length - 1;
        const shouldMarkAsCompleted = 
          course?.isCompleted && (isLastSection || newProgress === 100);

        try {
          await updateCourseProgress(id, {
            progress: newProgress,
            currentLesson: currentLessonIndex,
            completed: shouldMarkAsCompleted,
            completedSections: Array.from(newCompletedSections)
          });
          
          console.log(`Progress updated: ${newProgress}%`);
          setProgress(newProgress);
          if (shouldMarkAsCompleted && !isCompleted) {
            setIsCompleted(true);
            toast.success("Congratulations! You've completed this course!");
            confetti();
          }

          const section = courseStructure.chapters[chapterIndex]?.subchapters[subchapterIndex]?.sections[sectionIndex];
          if (section) {
            toast.success(`Section "${section.title}" completed!`);
          }
          
          checkForNewlyUnlockedContent(previousUnlockStates);
        } catch (error: any) {
          console.error("Error updating progress:", error);
          if (error.response?.status === 401) {
            toast.error("Your session has expired. Please log in again.");
            setTimeout(() => navigate('/LoginPage'), 2000);
          } else {
            toast.error("Failed to save your progress. Please check your connection.");
       }
        }
      }
    } catch (error) {
      console.error("Error in progress update logic:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // Check for newly unlocked content
  const checkForNewlyUnlockedContent = (previousUnlockStates: {
    chapters: boolean[],
    subchapters: boolean[][],
    sections: boolean[][][]
  }) => {
    if (!courseStructure) return;
    
    courseStructure.chapters.forEach((chapter, chapterIndex) => {
      const wasUnlocked = previousUnlockStates.chapters[chapterIndex];
      const isNowUnlocked = isChapterUnlocked(chapterIndex);
      if (!wasUnlocked && isNowUnlocked) {
        toast.info(`New chapter unlocked: "${chapter.title}"`, { duration: 5000 });
      }
      
      chapter.subchapters.forEach((subchapter, subchapterIndex) => {
        const subchapterWasUnlocked = previousUnlockStates.subchapters[chapterIndex]?.[subchapterIndex];
        const subchapterIsNowUnlocked = isSubchapterUnlocked(chapterIndex, subchapterIndex);
        if (!subchapterWasUnlocked && subchapterIsNowUnlocked) {
          toast.info(`New subchapter unlocked: "${subchapter.title}"`, { duration: 5000 });
        }
        
        subchapter.sections.forEach((section, sectionIndex) => {
          const sectionWasUnlocked = previousUnlockStates.sections[chapterIndex]?.[subchapterIndex]?.[sectionIndex];
          const sectionIsNowUnlocked = isSectionAccessible(chapterIndex, subchapterIndex, sectionIndex);
          if (!sectionWasUnlocked && sectionIsNowUnlocked && sectionIndex > 0) {
            toast.info(`New section unlocked: "${section.title}"`, { duration: 5000 });
          }
        });
      });
    });
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]
    );
  };

  // Toggle subchapter expansion
  const toggleSubchapter = (subchapterId: string) => {
    setExpandedSubchapters(prev => 
      prev.includes(subchapterId) ? prev.filter(id => id !== subchapterId) : [...prev, subchapterId]
    );
  };

  // Check if a chapter is unlocked
  const isChapterUnlocked = (chapterIndex: number): boolean => {
    if (chapterIndex === 0) return true;
    if (!courseStructure) return false;
    
    const prevChapter = courseStructure.chapters[chapterIndex - 1];
    if (!prevChapter) return true;
    
    let allSectionsCompleted = true;
    let allQuizzesCompleted = true;
    prevChapter.subchapters.forEach((subchapter, subchapterIndex) => {
      subchapter.sections.forEach((_, sectionIndex) => {
        const sectionId = `${chapterIndex - 1}-${subchapterIndex}-${sectionIndex}`;
        if (!completedSections.has(sectionId)) {
          allSectionsCompleted = false;
          console.log(`Chapter ${chapterIndex - 1} not unlocked due to incomplete section: ${sectionId}`);
        }
      });
      if (!hasCompletedAllSubchapterQuizzes(subchapter.title)) {
        allQuizzesCompleted = false;
        console.log(`Chapter ${chapterIndex - 1} not unlocked due to incomplete quizzes in subchapter: ${subchapter.title}`);
      }
    });
    
    return allSectionsCompleted && allQuizzesCompleted;
  };

  // Check if a subchapter is unlocked
  const isSubchapterUnlocked = (chapterIndex: number, subchapterIndex: number) => {
    if (chapterIndex === 0 && subchapterIndex === 0) return true;
    if (!isChapterUnlocked(chapterIndex)) return false;
    if (subchapterIndex === 0) return true;
    
    const chapter = courseStructure?.chapters[chapterIndex];
    const previousSubchapter = chapter?.subchapters[subchapterIndex - 1];
    if (!previousSubchapter) return false;
    
    const allSectionsCompleted = previousSubchapter.sections?.every((_, sectionIndex) => {
      const sectionId = `${chapterIndex}-${subchapterIndex - 1}-${sectionIndex}`;
      return completedSections.has(sectionId);
    }) ?? false;
    
    const allQuizzesCompleted = hasCompletedAllSubchapterQuizzes(previousSubchapter.title);
    console.log(`Subchapter ${chapterIndex}.${subchapterIndex} unlocked: ${allSectionsCompleted && allQuizzesCompleted}`);
    return allSectionsCompleted && allQuizzesCompleted;
  };

  // Check if a section is accessible
  const isSectionAccessible = (chapterIndex: number, subchapterIndex: number, sectionIndex: number): boolean => {
    if (chapterIndex === 0 && subchapterIndex === 0 && sectionIndex === 0) return true;
    if (!isChapterUnlocked(chapterIndex) || !isSubchapterUnlocked(chapterIndex, subchapterIndex)) return false;
    
    if (sectionIndex > 0) {
      const prevSectionId = `${chapterIndex}-${subchapterIndex}-${sectionIndex - 1}`;
      if (!completedSections.has(prevSectionId)) {
        console.log(`Section ${chapterIndex}.${subchapterIndex}.${sectionIndex} not accessible due to incomplete previous section: ${prevSectionId}`);
        return false;
      }
      
      const subchapter = courseStructure?.chapters[chapterIndex]?.subchapters[subchapterIndex];
      if (subchapter) {
        const subchapterQuizzes = quizzesBySubchapter[subchapter.title] || [];
        if (subchapterQuizzes.length > 0) {
          const allQuizzesCompleted = hasCompletedAllSubchapterQuizzes(subchapter.title);
          if (!allQuizzesCompleted) {
            console.log(`Section ${chapterIndex}.${subchapterIndex}.${sectionIndex} not accessible due to incomplete quizzes in subchapter: ${subchapter.title}`);
            return false;
          }
        }
      }
    }
    
    return true;
  };

  // Handle back button
  const handleBack = () => {
    navigate('/course');
  };

  // Get quiz score display
  const getQuizScoreDisplay = (quizId: string): string => {
    const score = quizScores[quizId];
    return score === undefined ? 'Not attempted' : `${score}%`;
  };

  // Get section lock reason
  const getSectionLockReason = (chapterIndex: number, subchapterIndex: number, sectionIndex: number): string => {
    if (!isChapterUnlocked(chapterIndex)) {
      return 'Complete the previous chapter to unlock';
    }
    if (!isSubchapterUnlocked(chapterIndex, subchapterIndex)) {
      return 'Complete the previous subchapter to unlock';
    }
    if (sectionIndex > 0) {
      const prevSectionId = `${chapterIndex}-${subchapterIndex}-${sectionIndex - 1}`;
      if (!completedSections.has(prevSectionId)) {
        return 'Complete the previous section to unlock';
      }
      const subchapter = courseStructure?.chapters[chapterIndex]?.subchapters[subchapterIndex];
      if (subchapter && (quizzesBySubchapter[subchapter.title]?.length > 0)) {
        if (!hasCompletedAllSubchapterQuizzes(subchapter.title)) {
          return 'Complete all quizzes with at least 70% score to unlock';
        }
      }
    }
    return 'Locked';
  };

  // Check if all content is completed
  const hasCompletedAllAvailableContent = (): boolean => {
    if (!courseStructure) return false;
    
    let allCompleted = true;
    courseStructure.chapters.forEach((chapter, chapterIndex) => {
      chapter.subchapters.forEach((subchapter, subchapterIndex) => {
        subchapter.sections.forEach((_, sectionIndex) => {
          const sectionId = `${chapterIndex}-${subchapterIndex}-${sectionIndex}`;
          if (!completedSections.has(sectionId)) {
            allCompleted = false;
            console.log(`Not all content completed due to section: ${sectionId}`);
          }
        });
        if (!hasCompletedAllSubchapterQuizzes(subchapter.title)) {
          allCompleted = false;
          console.log(`Not all content completed due to quizzes in subchapter: ${subchapter.title}`);
        }
      });
    });
    return allCompleted;
  };

  // Render section content
  const renderSectionContent = () => {
    if (!selectedSection) {
      const userCompletedAllContent = hasCompletedAllAvailableContent();
      const adminMarkedCompleted = course?.isCompleted === true;
      const userOfficiallyCompleted = userCompletedAllContent && adminMarkedCompleted;
      
      if (userCompletedAllContent || adminMarkedCompleted) {
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
              <p className="text-green-700 mb-4">
                {userOfficiallyCompleted ? (
                  "You've officially completed this course!"
                ) : userCompletedAllContent ? (
                  "You've completed all the available content for this course."
                ) : (
                  "This course has been marked as completed by the administrator."
                )}
              </p>
              {course?.completionAnnouncement && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-2">Message from the instructor:</h4>
                  <p className="text-gray-700 italic">"{course.completionAnnouncement}"</p>
                </div>
              )}
              {adminMarkedCompleted && !userCompletedAllContent && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 font-medium">
                    Complete all remaining content to receive your official completion status.
                  </p>
                </div>
              )}
              {userCompletedAllContent && !adminMarkedCompleted && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-700 font-medium">
                    You've completed all content! Waiting for the administrator to mark this course as officially completed.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">
            Select a section from the course structure to view its content.
          </p>
        </div>
      );
    }

    if (selectedSection.videoUrl) {
      return (
        <div className="h-full overflow-y-auto">
          <div className="pb-6">
            <h2 className="text-2xl font-semibold mb-4">{selectedSection.title}</h2>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="mt-4">
                <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-700 mt-5 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="my-4 text-gray-700 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="my-4 pl-6 list-disc space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="my-4 pl-6 list-decimal space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-700 pl-2" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-4 my-4 italic text-gray-600" {...props} />,
                      code: ({node, className, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return (
                          <code 
                            className={
                              match
                                ? `bg-gray-800 text-white p-4 rounded-md my-4 overflow-x-auto text-sm font-mono language-${match[1]}`
                                : `bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-sm font-mono`
                            }
                            {...props}
                          />
                        )
                      },
                      a: ({node, ...props}) => <a className="text-purple-600 hover:text-purple-800 underline" {...props} />,
                      table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="min-w-full border-collapse border border-gray-300" {...props} /></div>,
                      th: ({node, ...props}) => <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />,
                      td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                      img: ({node, ...props}) => <img className="mx-auto my-6 rounded-lg shadow-md max-w-full h-auto" {...props} />
                    }}
                  >
                    {selectedSection.content}
                  </ReactMarkdown>
                </div>
              </TabsContent>
              <TabsContent value="video" className="mt-4">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <iframe 
                    src={getGoogleDriveEmbedUrl(selectedSection.videoUrl)}
                    className="w-full h-[450px] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedSection.title}
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    referrerPolicy="no-referrer"
                  ></iframe>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-full overflow-y-auto">
          <div className="pb-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 pb-2 border-b border-gray-200">{selectedSection.title}</h2>
            <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-700 mt-5 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="my-4 text-gray-700 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-4 pl-6 list-disc space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-4 pl-6 list-decimal space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-700 pl-2" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-4 my-4 italic text-gray-600" {...props} />,
                  code: ({node, className, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return (
                      <code 
                        className={
                          match
                            ? `bg-gray-800 text-white p-4 rounded-md my-4 overflow-x-auto text-sm font-mono language-${match[1]}`
                            : `bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-sm font-mono`
                        }
                        {...props}
                      />
                    )
                  },
                  a: ({node, ...props}) => <a className="text-purple-600 hover:text-purple-800 underline" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="min-w-full border-collapse border border-gray-300" {...props} /></div>,
                  th: ({node, ...props}) => <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />,
                  td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                  img: ({node, ...props}) => <img className="mx-auto my-6 rounded-lg shadow-md max-w-full h-auto" {...props} />
                }}
              >
                {selectedSection.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      );
    }
  };

  // Handle selecting a section
  const handleSelectSection = (chapterIndex: number, subchapterIndex: number, sectionIndex: number) => {
    if (!courseStructure) return;
    
    const section = courseStructure.chapters[chapterIndex]?.subchapters[subchapterIndex]?.sections[sectionIndex];
    if (!section) return;
    
    if (!isSectionAccessible(chapterIndex, subchapterIndex, sectionIndex)) {
      const reason = getSectionLockReason(chapterIndex, subchapterIndex, sectionIndex);
      toast.error(`This section is locked. ${reason}`);
      return;
    }
    
    setSelectedSection({
      chapterIndex,
      subchapterIndex,
      sectionIndex,
      title: section.title,
      content: section.generatedContent || 'No content available for this section.',
      videoUrl: section.videoUrl
    });
    
    updateProgress(chapterIndex, subchapterIndex, sectionIndex);
    setActiveTab('structure');
  };

  // View section content in modal
  const viewSectionContent = (section: Section) => {
    setSelectedSectionTitle(section.title);
    setLoadingContent(true);
    setIsContentModalOpen(true);
    
    if (section.generatedContent) {
      setSelectedSectionContent(section.generatedContent);
      setLoadingContent(false);
    } else {
      setSelectedSectionContent('No content available for this section.');
      setLoadingContent(false);
    }
  };

  // Section Content Modal component
  const SectionContentModal = () => {
    return (
      <Dialog open={isContentModalOpen} onOpenChange={setIsContentModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSectionTitle}</DialogTitle>
            <DialogDescription>Section content</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8 text-[#8A63FF]" />
                <span className="ml-2">Loading content...</span>
              </div>
            ) : selectedSectionContent ? (
              <div className="prose prose-lg max-w-none dark:prose-invert bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <ReactMarkdown 
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-700 mt-5 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="my-4 text-gray-700 leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="my-4 pl-6 list-disc space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="my-4 pl-6 list-decimal space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="text-gray-700 pl-2" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-4 my-4 italic text-gray-600" {...props} />,
                    code: ({node, className, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return (
                        <code 
                          className={
                            match
                              ? `bg-gray-800 text-white p-4 rounded-md my-4 overflow-x-auto text-sm font-mono language-${match[1]}`
                              : `bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-sm font-mono`
                          }
                          {...props}
                        />
                      )
                    },
                    a: ({node, ...props}) => <a className="text-purple-600 hover:text-purple-800 underline" {...props} />,
                    table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="min-w-full border-collapse border border-gray-300" {...props} /></div>,
                    th: ({node, ...props}) => <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />,
                    td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                    img: ({node, ...props}) => <img className="mx-auto my-6 rounded-lg shadow-md max-w-full h-auto" {...props} />
                  }}
                >
                  {selectedSectionContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No content available for this section.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContentModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Render course structure
  const renderCourseStructure = () => {
    if (!courseStructure || !courseStructure.chapters) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No course structure available.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {courseStructure.chapters.map((chapter, chapterIndex) => {
          const isChapterExpanded = expandedChapters.includes(chapter.id);
          const isUnlocked = isChapterUnlocked(chapterIndex);
          const chapterProgress = calculateChapterProgress(chapterIndex);
          
          return (
            <div key={chapter.id} className="border rounded-lg overflow-hidden">
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer ${
                  isUnlocked ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
                }`}
                onClick={() => isUnlocked && toggleChapter(chapter.id)}
                title={!isUnlocked ? 'Complete the previous chapter to unlock' : ''}
              >
                <div className="flex items-center space-x-2">
                  {isUnlocked ? (
                    <BookOpen className="h-5 w-5 text-[#8A63FF]" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="flex flex-col">
                    <span className={`font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {chapter.title}
                    </span>
                    {isUnlocked && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={chapterProgress} className="h-1 w-24" />
                        <span className="text-xs text-gray-500">{chapterProgress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {isUnlocked && (
                    isChapterExpanded ? 
                    <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
              
              {isChapterExpanded && isUnlocked && (
                <div className="border-t">
                  {chapter.subchapters.map((subchapter, subchapterIndex) => {
                    const isSubchapterExpanded = expandedSubchapters.includes(subchapter.id);
                    const isSubUnlocked = isSubchapterUnlocked(chapterIndex, subchapterIndex);
                    const subchapterQuizzes = quizzesBySubchapter[subchapter.title] || [];
                    const subchapterProgress = calculateSubchapterProgress(chapterIndex, subchapterIndex);
    
                    return (
                      <div key={subchapter.id} className="border-b last:border-b-0">
                        <div 
                          className={`flex items-center justify-between p-3 pl-8 cursor-pointer ${
                            isSubUnlocked ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
                          }`}
                          onClick={() => isSubUnlocked && toggleSubchapter(subchapter.id)}
                          title={!isSubUnlocked ? 'Complete the previous subchapter to unlock' : ''}
                        >
                          <div className="flex items-center space-x-2">
                            {isSubUnlocked ? (
                              <BookOpen className="h-4 w-4 text-[#8A63FF]" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                            <div className="flex flex-col">
                              <span className={`text-sm ${isSubUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                                {subchapter.title}
                              </span>
                              {isSubUnlocked && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <Progress value={subchapterProgress} className="h-1 w-20" />
                                  <span className="text-xs text-gray-500">{subchapterProgress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {isSubUnlocked && (
                              isSubchapterExpanded ? 
                              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {isSubchapterExpanded && isSubUnlocked && (
                          <div>
                            {subchapter.sections.map((section, sectionIndex) => {
                              const sectionId = `${chapterIndex}-${subchapterIndex}-${sectionIndex}`;
                              const isCompleted = completedSections.has(sectionId);
                              const isSectionUnlocked = isSectionAccessible(chapterIndex, subchapterIndex, sectionIndex);
                              const lockReason = !isSectionUnlocked ? getSectionLockReason(chapterIndex, subchapterIndex, sectionIndex) : '';
                              const isLockedDueToQuiz = !isSectionUnlocked && 
                                lockReason.includes('quiz') && 
                                completedSections.has(`${chapterIndex}-${subchapterIndex}-${sectionIndex-1}`);

                              return (
                                <div 
                                  key={section.id} 
                                  className={`flex items-center justify-between p-2 pl-12 ${
                                    isSectionUnlocked 
                                      ? 'hover:bg-gray-50 cursor-pointer' 
                                      : isLockedDueToQuiz
                                        ? 'bg-orange-50 opacity-80 cursor-not-allowed'
                                        : 'bg-gray-50 opacity-60 cursor-not-allowed'
                                  }`}
                                  onClick={() => {
                                    if (isSectionUnlocked) {
                                      handleSelectSection(chapterIndex, subchapterIndex, sectionIndex);
                                      setActiveTab('structure');
                                    }
                                  }}
                                  title={lockReason}
                                >
                                  <div className="flex items-center space-x-2">
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : isSectionUnlocked ? (
                                      <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                                    ) : isLockedDueToQuiz ? (
                                      <FileQuestion className="h-4 w-4 text-orange-500" />
                                    ) : (
                                      <Lock className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className={`text-sm ${
                                      isSectionUnlocked 
                                        ? 'text-gray-700' 
                                        : isLockedDueToQuiz 
                                          ? 'text-orange-700'
                                          : 'text-gray-500'
                                    }`}>
                                      {section.title}
                                    </span>
                                    {isLockedDueToQuiz && (
                                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                        Requires Quiz
                                      </Badge>
                                    )}
                                  </div>
                                  {isSectionUnlocked && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        viewSectionContent(section);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                            
                            {subchapterQuizzes.map(quiz => {
                              const isQuizCompleted = completedQuizzes.has(quiz._id);
                              const lastSectionIndex = subchapter.sections.length - 1;
                              const lastSectionId = `${chapterIndex}-${subchapterIndex}-${lastSectionIndex}`;
                              const isQuizUnlocked = completedSections.has(lastSectionId);
                              const quizScore = getQuizScoreDisplay(quiz._id);
                              const quizScoreDisplay = isQuizCompleted ? 
                                `Passed (${quizScore})` : 
                                quizScore !== 'Not attempted' ? 
                                `Score: ${quizScore}` : '';

                              return (
                                <Link 
                                  key={quiz._id} 
                                  to={isQuizUnlocked ? `/course/${id}/quiz/${quiz._id}` : '#'}
                                  onClick={(e) => !isQuizUnlocked && e.preventDefault()}
                                  className={`flex items-center justify-between p-2 pl-12 ${
                                    isQuizUnlocked 
                                      ? 'hover:bg-gray-50 cursor-pointer' 
                                      : 'bg-gray-50 opacity-60 cursor-not-allowed'
                                  }`}
                                  title={!isQuizUnlocked ? 'Complete all sections first' : ''}
                                >
                                  <div className="flex items-center space-x-2">
                                    {isQuizCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : isQuizUnlocked ? (
                                      <FileQuestion className="h-4 w-4 text-orange-500" />
                                    ) : (
                                      <Lock className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className={`text-sm ${isQuizUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                                      {quiz.title}
                                    </span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        isQuizUnlocked 
                                          ? 'bg-orange-50 text-orange-800 border-orange-200' 
                                          : 'bg-gray-50 text-gray-500 border-gray-300'
                                      }`}
                                    >
                                      Quiz
                                    </Badge>
                                    {quizScoreDisplay && (
                                      <span className={`text-xs ${
                                        isQuizCompleted ? 'text-green-600' : 'text-orange-600'
                                      }`}>
                                        {quizScoreDisplay}
                                      </span>
                                    )}
                                  </div>
                                  {!isQuizUnlocked ? (
                                    <div className="mr-2 text-xs text-gray-500">
                                      Complete all sections first
                                    </div>
                                  ) : !isQuizCompleted && (
                                    <div className="mr-2 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                      Required to unlock next section
                                    </div>
                                  )}
                                </Link>
                              );
                            })}
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
    );
  };

  // Main render
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Spinner className="h-12 w-12 text-[#8A63FF]" />
          <span className="ml-2 text-gray-600">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{error || 'Course not found'}</h1>
            <p className="text-gray-600 mb-4">We couldn't load this course. Please try again later.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          {isCompleted && (
            <Badge className="ml-2 bg-green-500">Completed</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="structure" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
                <TabsTrigger value="materials" className="flex items-center">
                  <BookMarked className="h-4 w-4 mr-2" />
                  Study Materials
                </TabsTrigger>
              </TabsList>
          
              <TabsContent value="structure">
                {renderSectionContent()}
              </TabsContent>
              
              <TabsContent value="videos">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Videos</CardTitle>
                    <CardDescription>Watch video content for this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {courseStructure?.chapters?.length ? (
                      <div className="space-y-6">
                        {courseStructure.chapters.map((chapter, chapterIndex) => {
                          const isChapterAccessible = isChapterUnlocked(chapterIndex);
                          return (
                            <div key={chapter.id} className={`border rounded-lg ${!isChapterAccessible ? 'opacity-60' : ''}`}>
                              <div className="bg-gray-50 p-3 font-medium border-b">
                                Chapter {chapterIndex + 1}: {chapter.title}
                                {!isChapterAccessible && (
                                  <span className="ml-2 text-sm text-gray-500">(Complete previous chapter to unlock)</span>
                                )}
                              </div>
                              <div className="p-3">
                                {chapter.subchapters.map((subchapter, subchapterIndex) => {
                                  const isSubchapterAccessible = isChapterAccessible && isSubchapterUnlocked(chapterIndex, subchapterIndex);
                                  const hasVideos = subchapter.sections.some(section => section.videoUrl);
                                  if (!hasVideos) return null;
                                  return (
                                    <div key={subchapter.id} className={`mb-4 last:mb-0 ${!isSubchapterAccessible ? 'opacity-60' : ''}`}>
                                      <h3 className="text-sm font-semibold mb-2">
                                        {chapterIndex + 1}.{subchapterIndex + 1}: {subchapter.title}
                                        {!isSubchapterAccessible && (
                                          <span className="ml-2 text-xs text-gray-500">(Locked)</span>
                                        )}
                                      </h3>
                                      <div className="space-y-2 ml-4">
                                        {subchapter.sections.map((section, sectionIndex) => {
                                          if (!section.videoUrl) return null;
                                          const isSectionUnlocked = isSubchapterAccessible && 
                                            isSectionAccessible(chapterIndex, subchapterIndex, sectionIndex);
                                          return (
                                            <Card key={section.id} className={`border border-gray-200 ${!isSectionUnlocked ? 'opacity-60' : ''}`}>
                                              <CardHeader className="py-3 px-4">
                                                <div className="flex justify-between items-center">
                                                  <CardTitle className="text-sm">
                                                    {chapterIndex + 1}.{subchapterIndex + 1}.{sectionIndex + 1}: {section.title}
                                                  </CardTitle>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!isSectionUnlocked}
                                                  >
                                                    {isSectionUnlocked ? 'Watch Video' : 'Locked'}
                                                  </Button>
                                                </div>
                                                {!isSectionUnlocked && (
                                                  <CardDescription className="mt-1 text-orange-600 flex items-center">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Complete previous sections to unlock
                                                  </CardDescription>
                                                )}
                                              </CardHeader>
                                            </Card>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No videos available for this course.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="materials">
                <StudyMaterialsList courseId={id || ''} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>
                  {progress}% Complete
                  {isCompleted && (
                    <span className="ml-2 text-green-500">
                      (Course Completed)
                    </span>
                  )}
                </CardDescription>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh]">
                  {renderCourseStructure()}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      
        {SectionContentModal()}
      </div>
    </div>
  );
};

// Helper function for Google Drive embed URL
const getGoogleDriveEmbedUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.split('/file/d/')[1].split('/')[0];
    return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal&disableExtensions=true&hl=en`;
  } else if (url.includes('drive.google.com/open?id=')) {
    const fileId = url.split('open?id=')[1].split('&')[0];
    return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal&disableExtensions=true&hl=en`;
  }
  if (url.includes('/preview')) {
    return url.includes('?') ? `${url}&rm=minimal&disableExtensions=true&hl=en` : `${url}?rm=minimal&disableExtensions=true&hl=en`;
  }
  return url;
};

export default LearningModule;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, FileText, ListChecks, Plus, Sparkles, Eye, FileQuestion, Flag, Trash2, Users, BookMarked, ClipboardList, PlusCircle, X } from 'lucide-react';
import courseStructureService, { CourseStructure, Chapter, Subchapter, Section } from '@/services/courseStructureService';
import courseService from '@/services/courseService';
import authService from '@/services/authService';
import quizService, { IQuiz } from '@/services/quizService';
import { Badge } from '@/components/ui/badge';
import SectionContentModal from '@/components/admin/SectionContentModal';
import QuizPreviewModal from '@/components/admin/QuizPreviewModal';
import AddChapterModal from '@/components/admin/AddChapterModal';
import CourseCompletionModal from '@/components/admin/CourseCompletionModal';
import CompletedUsersModal from '@/components/admin/CompletedUsersModal';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import AssignmentsManager from '@/components/admin/AssignmentsManager';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Interface for our component's state that includes both _id and id fields
interface ExtendedChapter extends Omit<Chapter, 'id'> {
  id?: string;
  _id?: string;
}

interface ExtendedSubchapter extends Omit<Subchapter, 'id'> {
  id?: string;
  _id?: string;
  quizzes?: IQuiz[];
}

interface ExtendedSection extends Omit<Section, 'id'> {
  id?: string;
  _id?: string;
  generatedContent?: string;
  videoUrl?: string;
}

interface ExtendedCourseStructure extends Omit<CourseStructure, '_id'> {
  _id?: string;
  courseId?: string;
}

const AdminCourseStructurePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [courseStructure, setCourseStructure] = useState<ExtendedCourseStructure | null>(null);
  const [activeTab, setActiveTab] = useState('structure');
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({});
  const [expandedSubchapters, setExpandedSubchapters] = useState<{ [key: string]: boolean }>({});
  const [currentlyEditing, setCurrentlyEditing] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  
  // Modal state for viewing section content
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedSectionTitle, setSelectedSectionTitle] = useState('');
  const [selectedSectionContent, setSelectedSectionContent] = useState<string | undefined>('');
  const [loadingContent, setLoadingContent] = useState(false);
  
  // Modal state for viewing quiz content
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz | null>(null);
  
  // Modal state for adding new chapter
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  
  // Modal state for course completion
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  
  // Modal state for completed users
  const [isCompletedUsersModalOpen, setIsCompletedUsersModalOpen] = useState(false);
  
  // Alert dialog for chapter deletion
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<{ id: string, title: string } | null>(null);

  // Add selectedSectionId state for keeping track of which section is currently open
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSectionVideoUrl, setSelectedSectionVideoUrl] = useState<string>('');

  // Enhanced state for AI chapter generation modal
  const [isAIChapterModalOpen, setIsAIChapterModalOpen] = useState(false);
  const [aiChapterTitle, setAIChapterTitle] = useState('');
  const [aiChapterDescription, setAIChapterDescription] = useState('');
  const [aiSubchapters, setAISubchapters] = useState<{title: string, description: string}[]>([
    { title: '', description: '' }
  ]);
  const [aiGenerating, setAIGenerating] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData.data.role === 'admin') {
          setIsAdmin(true);
          fetchCourseData();
        } else {
          toast.error('You do not have permission to access this page');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Authentication error');
        navigate('/LoginPage');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, courseId]);

  // Get an ID from a chapter, subchapter, or section (handles both id and _id)
  const getItemId = (item: any): string => {
    return item.id || item._id || '';
  };

  // Fetch course data
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseData = await courseService.getCourseById(courseId || '');
      setCourse(courseData);
      
      // Fetch course structure
      const structureData = await courseStructureService.getCourseStructure(courseId || '');
      console.log('Fetched course structure:', structureData);
      
      if (structureData) {
        setCourseStructure(structureData);
        
        // Initialize expanded state
        if (structureData.chapters) {
          const chaptersState = structureData.chapters.reduce<{ [key: string]: boolean }>((acc, chapter) => {
            const chapterId = getItemId(chapter);
            if (chapterId) {
              acc[chapterId] = true; // Set all chapters expanded by default
            }
            return acc;
          }, {});
          setExpandedChapters(chaptersState);
          
          const subchaptersState = structureData.chapters.reduce<{ [key: string]: boolean }>((acc, chapter) => {
            chapter.subchapters.forEach(subchapter => {
              const subchapterId = getItemId(subchapter);
              if (subchapterId) {
                acc[subchapterId] = false; // Set all subchapters collapsed by default
              }
            });
            return acc;
          }, {});
          setExpandedSubchapters(subchaptersState);
        }
      } else {
        console.log('No course structure data found');
      }
      
      // Fetch quizzes
      await fetchQuizzes();
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch quizzes for the course
  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const quizzesData = await quizService.getQuizzesByCourse(courseId || '');
      setQuizzes(quizzesData);
      console.log('Fetched quizzes:', quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };
  
  // Get quizzes for a specific subchapter
  const getSubchapterQuizzes = (subchapterTitle: string): IQuiz[] => {
    return quizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(subchapterTitle.toLowerCase())
    );
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // Toggle subchapter expansion
  const toggleSubchapter = (subchapterId: string) => {
    setExpandedSubchapters(prev => ({
      ...prev,
      [subchapterId]: !prev[subchapterId]
    }));
  };
  
  // View section content
  const viewSectionContent = (section: ExtendedSection) => {
    setSelectedSectionTitle(section.title);
    setSelectedSectionId(section.id || section._id || '');
    setSelectedSectionVideoUrl(section.videoUrl || '');
    setLoadingContent(true);
    setIsContentModalOpen(true);
    
    // If we have generatedContent in the section, use it directly
    if (section.generatedContent) {
      setSelectedSectionContent(section.generatedContent);
      setLoadingContent(false);
    } else {
      // Otherwise, display a message
      setSelectedSectionContent('No content available for this section.');
      setLoadingContent(false);
    }
  };
  
  // View quiz content
  const viewQuizContent = (quiz: IQuiz) => {
    setSelectedQuiz(quiz);
    setIsQuizModalOpen(true);
  };

  // Add a new subchapter input field
  const addSubchapterField = () => {
    setAISubchapters([...aiSubchapters, { title: '', description: '' }]);
  };

  // Remove a subchapter input field
  const removeSubchapterField = (index: number) => {
    if (aiSubchapters.length > 1) {
      const updatedSubchapters = [...aiSubchapters];
      updatedSubchapters.splice(index, 1);
      setAISubchapters(updatedSubchapters);
    }
  };

  // Update a subchapter field
  const updateSubchapterField = (index: number, field: 'title' | 'description', value: string) => {
    const updatedSubchapters = [...aiSubchapters];
    updatedSubchapters[index][field] = value;
    setAISubchapters(updatedSubchapters);
  };

  // Generate content using AI with user-provided chapter and subchapter info
  const handleGenerateAIChapter = async () => {
    if (!aiChapterTitle.trim()) {
      toast.error('Please provide a chapter title');
      return;
    }
    
    // Validate that at least one subchapter has a title
    const hasValidSubchapter = aiSubchapters.some(sub => sub.title.trim() !== '');
    if (!hasValidSubchapter) {
      toast.error('Please provide at least one subchapter title');
      return;
    }
    
    try {
      setAIGenerating(true);
      toast.info('Creating chapter with AI. This may take a moment...');
      
      // Filter out empty subchapter titles
      const validSubchapters = aiSubchapters.filter(sub => sub.title.trim() !== '');
      
      // Create a properly formatted chapter object with subchapters
      const newChapter = {
        id: '',
        title: aiChapterTitle,
        description: aiChapterDescription,
        subchapters: validSubchapters.map((subchapter, index) => ({
          id: '',
          title: subchapter.title,
          description: subchapter.description || '',
          order: index,
          sections: [
            {
              id: '',
              title: 'Introduction to ' + subchapter.title,
              description: 'AI-generated introduction section',
              content: '',
              order: 0,
              learningObjectives: [],
              keywords: []
            }
          ]
        }))
      } as Chapter;
      
      // Use the addChapter endpoint to create the new chapter with initial structure
      const savedChapter = await courseStructureService.addChapter(courseId || '', newChapter);
      
      toast.success(`Chapter "${aiChapterTitle}" created successfully!`);
      
      // Reset form fields
      setAIChapterTitle('');
      setAIChapterDescription('');
      setAISubchapters([{ title: '', description: '' }]);
      
      // Close the modal
      setIsAIChapterModalOpen(false);
      
      // Refresh data
      fetchCourseData();
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast.error('Failed to create chapter');
    } finally {
      setAIGenerating(false);
    }
  };

  // Navigate to course management
  const handleBackToManagement = () => {
    navigate('/admin/courses');
  };

  // Handle adding a new chapter
  const handleAddChapter = async (newChapter: any) => {
    if (!courseStructure || !courseId) return;
    
    try {
      setLoading(true);
      
      // Use the dedicated addChapter method from the service
      const formattedChapter: ExtendedChapter = {
        id: newChapter.id,
        title: newChapter.title,
        description: newChapter.description,
        subchapters: newChapter.subchapters.map((subchapter: any, subIndex: number) => ({
          id: subchapter.id,
          title: subchapter.title,
          description: subchapter.description,
          sections: subchapter.sections.map((section: any, secIndex: number) => ({
            id: section.id,
            title: section.title,
            description: section.description,
            aiGenerated: false
          }))
        }))
      };
      
      // Add the new chapter using the dedicated endpoint
      const savedChapter = await courseStructureService.addChapter(courseId, formattedChapter as Chapter);
      
      // Fetch the updated course structure
      const updatedStructure = await courseStructureService.getCourseStructure(courseId);
      
      // Update the local state
      setCourseStructure(updatedStructure);
      
      // Expand the newly added chapter
      setExpandedChapters(prev => ({
        ...prev,
        [formattedChapter.id || '']: true
      }));
      
      toast.success('Chapter added successfully');
    } catch (error) {
      console.error('Error adding chapter:', error);
      toast.error('Failed to add chapter');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a chapter
  const handleDeleteChapter = async () => {
    if (!courseId || !chapterToDelete) return;
    
    try {
      setLoading(true);
      
      // Delete the chapter
      await courseStructureService.deleteChapter(courseId, chapterToDelete.id);
      
      // Fetch the updated course structure
      const updatedStructure = await courseStructureService.getCourseStructure(courseId);
      
      // Update the local state
      setCourseStructure(updatedStructure);
      
      toast.success(`Chapter "${chapterToDelete.title}" deleted successfully`);
      
      // Close the alert dialog
      setIsDeleteAlertOpen(false);
      setChapterToDelete(null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Failed to delete chapter');
    } finally {
      setLoading(false);
    }
  };
  
  // Open delete confirmation dialog
  const openDeleteConfirmation = (chapterId: string, chapterTitle: string) => {
    setChapterToDelete({ id: chapterId, title: chapterTitle });
    setIsDeleteAlertOpen(true);
  };
  
  // Handle course completion settings
  const handleCourseCompletion = async (data: { completionAnnouncement: string, isCompleted: boolean }) => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      
      // Update course completion settings
      await courseService.setCourseCompletion(courseId, data);
      
      // Fetch updated course data
      const updatedCourse = await courseService.getCourseById(courseId);
      setCourse(updatedCourse);
      
      toast.success('Course completion settings updated');
    } catch (error) {
      console.error('Error updating course completion settings:', error);
      toast.error('Failed to update course completion settings');
    } finally {
      setLoading(false);
    }
  };

  // Add a new function to save the video URL for a section
  const saveVideoUrl = async (videoUrl: string) => {
    if (!selectedSectionId || !courseId) {
      toast.error('Could not identify section to save video URL');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}/structure/section/${selectedSectionId}/video`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ videoUrl })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update video URL');
      }

      // Update the local state
      setSelectedSectionVideoUrl(videoUrl);

      // Update the course structure state to reflect the changes
      if (courseStructure) {
        const updatedChapters = courseStructure.chapters.map(chapter => {
          const updatedSubchapters = chapter.subchapters.map(subchapter => {
            const updatedSections = subchapter.sections.map(section => {
              const sectionId = section.id || section._id || '';
              if (sectionId === selectedSectionId) {
                return { ...section, videoUrl };
              }
              return section;
            });
            return { ...subchapter, sections: updatedSections };
          });
          return { ...chapter, subchapters: updatedSubchapters };
        });
        
        setCourseStructure({ ...courseStructure, chapters: updatedChapters });
      }
      
      // Show success message
      toast.success('Video URL saved successfully');
    } catch (error) {
      console.error('Error saving video URL:', error);
      toast.error('Failed to save video URL');
      throw error;
    }
  };

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Spinner className="h-8 w-8 border-2 border-primary" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-8 w-8 border-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleBackToManagement}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course Management
                </Button>
                <h1 className="text-2xl font-bold">{course?.title}</h1>
                {course?.isCompleted && (
                  <Badge variant="default" className="ml-2 bg-green-500">Course Completed</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCompletedUsersModalOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Completed Users
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCompletionModalOpen(true)}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {course?.isCompleted ? 'Update Completion Status' : 'Mark as Completed'}
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="structure" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Course Structure
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
                <TabsTrigger value="materials" className="flex items-center">
                  <BookMarked className="h-4 w-4 mr-2" />
                  Study Materials
                </TabsTrigger>
                <TabsTrigger value="assignments" className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Assignments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="structure">
                {/* Replace Add Chapter Button to open AI chapter modal */}
                <div className="flex justify-end mb-4">
                  <Button 
                    onClick={() => setIsAIChapterModalOpen(true)}
                    className="bg-[#8A63FF] hover:bg-[#7A53EF]"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Add Chapter with AI
                  </Button>
                </div>
                
                {courseStructure?.chapters?.length ? (
                  courseStructure.chapters.map((chapter, chapterIndex) => {
                    const chapterId = getItemId(chapter);
                    return (
                      <Card key={chapterId || chapterIndex} className="mb-6">
                        <CardHeader 
                          className={`cursor-pointer ${expandedChapters[chapterId] ? 'border-b' : ''}`}
                          onClick={() => toggleChapter(chapterId)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                Chapter {chapterIndex + 1}: {chapter.title}
                              </CardTitle>
                              <CardDescription>{chapter.description}</CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteConfirmation(chapterId, chapter.title);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                              <Button variant="outline" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                toggleChapter(chapterId);
                              }}>
                                {expandedChapters[chapterId] ? 'Collapse' : 'Expand'}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {expandedChapters[chapterId] && (
                          <CardContent className="pt-4">
                            {chapter.subchapters.map((subchapter, subchapterIndex) => {
                              const subchapterId = getItemId(subchapter);
                              const subchapterQuizzes = getSubchapterQuizzes(subchapter.title);
                              return (
                                <Card key={subchapterId || `${chapterIndex}-${subchapterIndex}`} className="mb-4">
                                  <CardHeader 
                                    className={`cursor-pointer ${expandedSubchapters[subchapterId] ? 'border-b' : ''}`}
                                    onClick={() => toggleSubchapter(subchapterId)}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-md">
                                          {chapterIndex + 1}.{subchapterIndex + 1}: {subchapter.title}
                                        </CardTitle>
                                        <CardDescription>{subchapter.description}</CardDescription>
                                      </div>
                                      <div className="flex items-center">
                                        {subchapterQuizzes.length > 0 && (
                                          <Badge className="bg-blue-100 text-blue-800 mr-2">
                                            <FileQuestion className="h-3 w-3 mr-1" />
                                            {subchapterQuizzes.length} Quizzes
                                          </Badge>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSubchapter(subchapterId);
                                        }}>
                                          {expandedSubchapters[subchapterId] ? 'Collapse' : 'Expand'}
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  
                                  {expandedSubchapters[subchapterId] && (
                                    <CardContent>
                                      <div className="mb-4">
                                        <h4 className="text-sm font-semibold mb-2">Sections</h4>
                                        {subchapter.sections.map((section, sectionIndex) => {
                                          const sectionId = getItemId(section);
                                          return (
                                            <Card 
                                              key={sectionId || `${chapterIndex}-${subchapterIndex}-${sectionIndex}`} 
                                              className="mb-2 border-l-4 border-l-[#8A63FF] hover:bg-gray-50 cursor-pointer"
                                              onClick={() => viewSectionContent(section as ExtendedSection)}
                                            >
                                              <CardHeader className="py-3">
                                                <div className="flex justify-between items-center">
                                                  <CardTitle className="text-sm">
                                                    {chapterIndex + 1}.{subchapterIndex + 1}.{sectionIndex + 1}: {section.title}
                                                  </CardTitle>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      viewSectionContent(section as ExtendedSection);
                                                    }}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </CardHeader>
                                              <CardContent className="pt-0 pb-3">
                                                <p className="text-sm text-gray-600">
                                                  {(section as ExtendedSection).generatedContent ? 
                                                    `${(section as ExtendedSection).generatedContent.substring(0, 150)}...` :
                                                    'No content available'}
                                                </p>
                                              </CardContent>
                                            </Card>
                                          );
                                        })}
                                      </div>
                                      
                                      {subchapterQuizzes.length > 0 && (
                                        <div>
                                          <h4 className="text-sm font-semibold mb-2">Quizzes</h4>
                                          {subchapterQuizzes.map((quiz) => (
                                            <Card 
                                              key={quiz._id} 
                                              className="mb-2 border-l-4 border-l-blue-500 hover:bg-gray-50 cursor-pointer"
                                              onClick={() => viewQuizContent(quiz)}
                                            >
                                              <CardHeader className="py-3">
                                                <div className="flex justify-between items-center">
                                                  <div>
                                                    <CardTitle className="text-sm">{quiz.title}</CardTitle>
                                                    <CardDescription className="text-xs">
                                                      {quiz.questions.length} questions | {quiz.timeLimit} min | Pass: {quiz.passingScore}%
                                                    </CardDescription>
                                                  </div>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      viewQuizContent(quiz);
                                                    }}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </CardHeader>
                                            </Card>
                                          ))}
                                        </div>
                                      )}
                                    </CardContent>
                                  )}
                                </Card>
                              );
                            })}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })
                ) : (
                  <Card className="py-12">
                    <CardContent className="flex flex-col items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">No course structure yet</h3>
                        <p className="text-gray-500 mb-4">This course doesn't have a structure defined</p>
                        <Button
                          onClick={() => setIsAIChapterModalOpen(true)}
                          className="bg-amber-500 hover:bg-amber-600"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate with AI
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="videos">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Videos</CardTitle>
                    <CardDescription>
                      Manage video content for course sections. Videos will be displayed in the learning module when students reach the corresponding section.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {courseStructure?.chapters?.length ? (
                      <div className="space-y-6">
                        {courseStructure.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter.id || chapterIndex} className="border rounded-lg">
                            <div className="bg-gray-50 p-3 font-medium border-b">
                              Chapter {chapterIndex + 1}: {chapter.title}
                            </div>
                            <div className="p-3">
                              {chapter.subchapters.map((subchapter, subchapterIndex) => (
                                <div key={subchapter.id || `${chapterIndex}-${subchapterIndex}`} className="mb-4 last:mb-0">
                                  <h3 className="text-sm font-semibold mb-2">{chapterIndex + 1}.{subchapterIndex + 1}: {subchapter.title}</h3>
                                  <div className="space-y-2 ml-4">
                                    {subchapter.sections.map((section, sectionIndex) => {
                                      const sectionId = section.id || section._id || '';
                                      return (
                                        <Card key={sectionId} className="border border-gray-200">
                                          <CardHeader className="py-3 px-4">
                                            <div className="flex justify-between items-center">
                                              <CardTitle className="text-sm">
                                                {chapterIndex + 1}.{subchapterIndex + 1}.{sectionIndex + 1}: {section.title}
                                              </CardTitle>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => viewSectionContent(section as ExtendedSection)}
                                              >
                                                {section.videoUrl ? 'Edit Video' : 'Add Video'}
                                              </Button>
                                            </div>
                                            {section.videoUrl && (
                                              <CardDescription className="mt-1 text-green-600 flex items-center">
                                                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                                Video URL added
                                              </CardDescription>
                                            )}
                                          </CardHeader>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No course structure available. Create a course structure first to add videos.</p>
                        <Button onClick={() => setActiveTab('structure')}>Go to Course Structure</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="materials">
                <StudyMaterialsManager courseId={courseId || ''} />
              </TabsContent>
              
              <TabsContent value="assignments">
                <AssignmentsManager courseId={courseId || ''} />
              </TabsContent>
            </Tabs>

            {/* Section Content Modal */}
            <SectionContentModal
              isOpen={isContentModalOpen}
              onClose={() => setIsContentModalOpen(false)}
              title={selectedSectionTitle}
              content={selectedSectionContent}
              isLoading={loadingContent}
              videoUrl={selectedSectionVideoUrl}
              onVideoUrlSave={saveVideoUrl}
              sectionId={selectedSectionId}
            />
            
            {/* Quiz Preview Modal */}
            {selectedQuiz && (
              <QuizPreviewModal
                isOpen={isQuizModalOpen}
                onClose={() => setIsQuizModalOpen(false)}
                quiz={selectedQuiz}
              />
            )}
            
            {/* Add Chapter Modal */}
            <AddChapterModal
              isOpen={isAddChapterModalOpen}
              onClose={() => setIsAddChapterModalOpen(false)}
              onSave={handleAddChapter}
              chapterOrder={courseStructure?.chapters?.length || 0}
            />
            
            {/* Course Completion Modal */}
            <CourseCompletionModal
              isOpen={isCompletionModalOpen}
              onClose={() => setIsCompletionModalOpen(false)}
              onSave={handleCourseCompletion}
              initialAnnouncement={course?.completionAnnouncement || ''}
              initialIsCompleted={course?.isCompleted || false}
            />
            
            {/* Completed Users Modal */}
            <CompletedUsersModal
              isOpen={isCompletedUsersModalOpen}
              onClose={() => setIsCompletedUsersModalOpen(false)}
              courseId={courseId || ''}
            />
            
            {/* Delete Chapter Confirmation Dialog */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the chapter "{chapterToDelete?.title}"?
                    This action cannot be undone and will remove all subchapters, sections, and associated quizzes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setChapterToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteChapter}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* AI Chapter Generation Modal */}
            <Dialog open={isAIChapterModalOpen} onOpenChange={setIsAIChapterModalOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate Chapter with AI</DialogTitle>
                  <DialogDescription>
                    Provide chapter and subchapter details. The AI will create sections and content based on this information.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Chapter Title and Description */}
                  <div className="grid gap-2">
                    <Label htmlFor="chapterTitle">Chapter Title*</Label>
                    <Input
                      id="chapterTitle"
                      placeholder="e.g., Introduction to JavaScript"
                      value={aiChapterTitle}
                      onChange={(e) => setAIChapterTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="chapterDescription">Chapter Description (Optional)</Label>
                    <Textarea
                      id="chapterDescription"
                      placeholder="Provide additional context for better AI generation"
                      value={aiChapterDescription}
                      onChange={(e) => setAIChapterDescription(e.target.value)}
                    />
                  </div>
                  
                  {/* Subchapter Inputs */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Subchapters*</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addSubchapterField}
                        className="flex items-center"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Subchapter
                      </Button>
                    </div>
                    
                    {aiSubchapters.map((subchapter, index) => (
                      <div key={index} className="grid gap-2 mb-4 p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`subchapterTitle-${index}`}>Subchapter {index + 1} Title*</Label>
                          {aiSubchapters.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSubchapterField(index)}
                              className="h-8 w-8 p-0 text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          id={`subchapterTitle-${index}`}
                          placeholder="e.g., Variables and Data Types"
                          value={subchapter.title}
                          onChange={(e) => updateSubchapterField(index, 'title', e.target.value)}
                        />
                        <Label htmlFor={`subchapterDescription-${index}`}>Description (Optional)</Label>
                        <Textarea
                          id={`subchapterDescription-${index}`}
                          placeholder="Brief description of this subchapter"
                          value={subchapter.description}
                          onChange={(e) => updateSubchapterField(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAIChapterModalOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleGenerateAIChapter}
                    className="bg-[#8A63FF] hover:bg-[#7A53EF]"
                    disabled={aiGenerating || !aiChapterTitle.trim() || !aiSubchapters.some(sub => sub.title.trim() !== '')}
                  >
                    {aiGenerating ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCourseStructurePage; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Save, Pen, FileQuestion, BookOpen, LayoutDashboard, Search, Sparkles, Wand2, BookText, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import courseService, { ICourse, ILesson } from '@/services/courseService';
import authService from '@/services/authService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import quizService, { IQuiz, IQuizQuestion, IQuizOption } from '@/services/quizService';
import { Badge } from '@/components/ui/badge';
import AIContentGenerationForm from '@/components/admin/AIContentGenerationForm';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import AssignmentsManager from '@/components/admin/AssignmentsManager';

const AdminCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAIGeneration, setIsAIGeneration] = useState(false);
  const [activeTab, setActiveTab] = useState('course');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    duration: 0,
    price: 0,
    discount: 0,
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    tags: [] as string[],
  });

  // Lessons state
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Partial<ILesson>>({
    title: '',
    content: '',
    duration: 0,
    order: 0,
    videoUrl: '',
  });
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);

  // Quiz state
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Partial<IQuiz>>({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    questions: [],
    isPublished: false
  });
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [editingQuizIndex, setEditingQuizIndex] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<IQuizQuestion>>({
    questionText: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ],
    explanation: '',
    points: 10
  });
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData.data.role === 'admin') {
          setIsAdmin(true);
          fetchCourses();
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
  }, [navigate]);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to course structure
  const navigateToCourseStructure = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/structure`);
  };

  // Navigate to course details
  const navigateToCourseDetails = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
  };

  // Filter courses based on search query and filters
  const filteredCourses = courses.filter(course => {
    // Search query filter
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    
    // Level filter
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(courses.map(course => course.category)));

  // Handle input change for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle number input change with validation
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue)) {
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    }
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  // Handle lesson input change
  const handleLessonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentLesson(prev => ({ ...prev, [name]: value }));
  };

  // Handle lesson number input change
  const handleLessonNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue)) {
      setCurrentLesson(prev => ({ ...prev, [name]: numberValue }));
    }
  };

  // Add or update lesson
  const handleSaveLesson = () => {
    if (!currentLesson.title || !currentLesson.content) {
      toast.error('Lesson title and content are required');
      return;
    }

    const lessonData = {
      ...currentLesson,
      title: currentLesson.title || '',
      content: currentLesson.content || '',
      duration: currentLesson.duration || 0,
      order: currentLesson.order || lessons.length + 1,
      videoUrl: currentLesson.videoUrl || '',
    } as ILesson;

    if (isEditingLesson && editingLessonIndex !== null) {
      // Update existing lesson
      const updatedLessons = [...lessons];
      updatedLessons[editingLessonIndex] = lessonData;
      setLessons(updatedLessons);
    } else {
      // Add new lesson
      setLessons([...lessons, lessonData]);
    }

    // Reset form
    setCurrentLesson({
      title: '',
      content: '',
      duration: 0,
      order: lessons.length + 2, // Next order
      videoUrl: '',
    });
    setIsEditingLesson(false);
    setEditingLessonIndex(null);
  };

  // Edit lesson
  const handleEditLesson = (index: number) => {
    const lesson = lessons[index];
    setCurrentLesson(lesson);
    setIsEditingLesson(true);
    setEditingLessonIndex(index);
  };

  // Delete lesson
  const handleDeleteLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    // Reorder lessons
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      order: i + 1,
    }));
    setLessons(reorderedLessons);
  };

  // Quiz management functions
  // Fetch quizzes for a course
  const fetchQuizzes = async (courseId: string) => {
    try {
      setLoading(true);
      const quizzesData = await quizService.getQuizzesByCourse(courseId);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Handle question input change
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  // Handle question points change
  const handleQuestionPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value);
    if (!isNaN(points)) {
      setCurrentQuestion(prev => ({ ...prev, points }));
    }
  };

  // Handle option text change
  const handleOptionTextChange = (index: number, value: string) => {
    setCurrentQuestion(prev => {
      const options = [...(prev.options || [])];
      options[index] = { ...options[index], optionText: value };
      return { ...prev, options };
    });
  };

  // Handle option correctness change
  const handleOptionCorrectChange = (index: number, isCorrect: boolean) => {
    setCurrentQuestion(prev => {
      const options = [...(prev.options || [])];
      options[index] = { ...options[index], isCorrect };
      return { ...prev, options };
    });
  };

  // Add new option
  const handleAddOption = () => {
    setCurrentQuestion(prev => {
      const options = [...(prev.options || []), { optionText: '', isCorrect: false }];
      return { ...prev, options };
    });
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    setCurrentQuestion(prev => {
      const options = (prev.options || []).filter((_, i) => i !== index);
      return { ...prev, options };
    });
  };

  // Save question
  const handleSaveQuestion = () => {
    if (!currentQuestion.questionText || !(currentQuestion.options || []).length) {
      toast.error('Question text and at least one option are required');
      return;
    }

    // Validate at least one correct answer
    if (!(currentQuestion.options || []).some(option => option.isCorrect)) {
      toast.error('At least one option must be marked as correct');
      return;
    }

    const questionData = {
      ...currentQuestion,
      questionText: currentQuestion.questionText || '',
      options: currentQuestion.options || [],
      points: currentQuestion.points || 10
    } as IQuizQuestion;

    setCurrentQuiz(prev => {
      const questions = [...(prev.questions || [])];
      
      if (isEditingQuestion && editingQuestionIndex !== null) {
        questions[editingQuestionIndex] = questionData;
      } else {
        questions.push(questionData);
      }
      
      return { ...prev, questions };
    });

    // Reset form
    setCurrentQuestion({
      questionText: '',
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ],
      explanation: '',
      points: 10
    });
    setIsEditingQuestion(false);
    setEditingQuestionIndex(null);
  };

  // Edit question
  const handleEditQuestion = (index: number) => {
    if (currentQuiz.questions && index < currentQuiz.questions.length) {
      setCurrentQuestion(currentQuiz.questions[index]);
      setIsEditingQuestion(true);
      setEditingQuestionIndex(index);
    }
  };

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    setCurrentQuiz(prev => {
      const questions = (prev.questions || []).filter((_, i) => i !== index);
      return { ...prev, questions };
    });
  };

  // Handle quiz input change
  const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentQuiz(prev => ({ ...prev, [name]: value }));
  };

  // Handle quiz number input change
  const handleQuizNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value);
    if (!isNaN(numberValue)) {
      setCurrentQuiz(prev => ({ ...prev, [name]: numberValue }));
    }
  };

  // Handle quiz published state change
  const handleQuizPublishedChange = (isPublished: boolean) => {
    setCurrentQuiz(prev => ({ ...prev, isPublished }));
  };

  // Save quiz
  const handleSaveQuiz = async () => {
    try {
      if (!currentQuiz.title || !currentQuiz.description) {
        toast.error('Quiz title and description are required');
        return;
      }

      if (!(currentQuiz.questions || []).length) {
        toast.error('Quiz must have at least one question');
        return;
      }

      const quizData = {
        ...currentQuiz,
        courseId: selectedCourse?._id
      };

      let savedQuiz;
      
      if (isEditingQuiz && editingQuizIndex !== null && quizzes[editingQuizIndex]._id) {
        // Update existing quiz
        savedQuiz = await quizService.updateQuiz(quizzes[editingQuizIndex]._id, quizData);
        toast.success('Quiz updated successfully');
      } else {
        // Create new quiz
        if (selectedCourse?._id) {
          savedQuiz = await quizService.createQuiz(selectedCourse._id, quizData);
          toast.success('Quiz created successfully');
        } else {
          toast.error('No course selected');
          return;
        }
      }

      // Refresh quizzes
      if (selectedCourse?._id) {
        await fetchQuizzes(selectedCourse._id);
      }
      
      // Reset form
      setCurrentQuiz({
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 70,
        questions: [],
        isPublished: false
      });
      setIsEditingQuiz(false);
      setEditingQuizIndex(null);
      
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    }
  };

  // Edit quiz
  const handleEditQuiz = (index: number) => {
    if (index < quizzes.length) {
      setCurrentQuiz(quizzes[index]);
      setIsEditingQuiz(true);
      setEditingQuizIndex(index);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        setLoading(true);
        await quizService.deleteQuiz(quizId);
        toast.success('Quiz deleted successfully');
        if (selectedCourse?._id) {
          await fetchQuizzes(selectedCourse._id);
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error('Failed to delete quiz');
      } finally {
        setLoading(false);
      }
    }
  };

  // Edit course
  const handleEditCourse = (course: ICourse) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || '',
      duration: course.duration || 0,
      price: course.price || 0,
      discount: course.discount || 0,
      level: course.level || 'beginner',
      category: course.category || '',
      tags: course.tags || [],
    });
    setLessons(course.lessons || []);
    setIsEditing(true);
    setIsAIGeneration(false);
    setActiveTab('course');
    
    // Fetch quizzes if we have a course ID
    if (course._id) {
      fetchQuizzes(course._id);
    }
  };

  // Create AI-generated course
  const handleCreateAICourse = () => {
    setIsAIGeneration(true);
    setIsEditing(false);
  };

  // Handle AI generation complete
  const handleAIGenerationComplete = (courseId: string) => {
    try {
      console.log(`AI course generation complete with ID: ${courseId}`);
      
      if (!courseId) {
        toast.error("No course ID provided");
        return;
      }
      
      setIsAIGeneration(false);
      fetchCourses();
      
      // Use longer timeout to ensure the course is ready before navigating
      toast.info("Finalizing course creation...", { duration: 3000 });
      setTimeout(() => {
        navigate(`/admin/courses/${courseId}`);
      }, 3000);
    } catch (error) {
      console.error("Error in handleAIGenerationComplete:", error);
      toast.error("Failed to navigate to course details");
    }
  };

  // Cancel editing/creating
  const handleCancel = () => {
    setIsEditing(false);
    setIsAIGeneration(false);
    setSelectedCourse(null);
  };

  // Save course
  const handleSaveCourse = async () => {
    try {
      setLoading(true);
      
      // Validate form
      if (!formData.title || !formData.description || !formData.category) {
        toast.error('Title, description, and category are required');
        setLoading(false);
        return;
      }

      // Calculate total duration from lessons
      const totalDuration = lessons.reduce((total, lesson) => total + lesson.duration, 0);
      
      const courseData = {
        ...formData,
        duration: totalDuration || formData.duration,
        lessons: lessons,
      };

      let savedCourse;
      
      if (isEditing && selectedCourse) {
        // Update existing course
        savedCourse = await courseService.updateCourse(selectedCourse._id, courseData);
        toast.success('Course updated successfully');
      } else {
        // Create new course
        savedCourse = await courseService.createCourse(courseData);
        toast.success('Course created successfully');
      }

      // Reset state
      setIsEditing(false);
      setIsAIGeneration(false);
      setSelectedCourse(null);
      
      // Refresh courses list
      fetchCourses();
      
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        setLoading(true);
        await courseService.deleteCourse(courseId);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !courses.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Spinner className="h-12 w-12 text-[#8A63FF]" />
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
          <div className="flex space-x-2">
            <Button 
              onClick={handleCreateAICourse}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Generate Course
            </Button>
          </div>
        </div>

        {isAIGeneration ? (
          <AIContentGenerationForm onComplete={handleAIGenerationComplete} />
        ) : isEditing ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Edit Course
            </h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="course">Course Details</TabsTrigger>
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="materials">Study Materials</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="course">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title*
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter course title"
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail URL
                    </label>
                    <Input
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleInputChange}
                      placeholder="Enter thumbnail URL"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price*
                    </label>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleNumberChange}
                      placeholder="Enter price"
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <Input
                      name="discount"
                      type="number"
                      value={formData.discount}
                      onChange={handleNumberChange}
                      placeholder="Enter discount percentage"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level*
                    </label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => handleSelectChange('level', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <Input
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Enter category"
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <Input
                      name="tags"
                      value={formData.tags.join(', ')}
                      onChange={handleTagsChange}
                      placeholder="Enter tags separated by commas"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <Input
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleNumberChange}
                      placeholder="Enter duration in minutes"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be calculated from lessons if not specified
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter course description"
                    className="w-full h-32"
                    required
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="lessons">
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Course Lessons</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-md font-medium mb-3">
                      {isEditingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lesson Title*
                        </label>
                        <Input
                          name="title"
                          value={currentLesson.title}
                          onChange={handleLessonChange}
                          placeholder="Enter lesson title"
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Video URL
                        </label>
                        <Input
                          name="videoUrl"
                          value={currentLesson.videoUrl}
                          onChange={handleLessonChange}
                          placeholder="Enter video URL"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)*
                        </label>
                        <Input
                          name="duration"
                          type="number"
                          value={currentLesson.duration}
                          onChange={handleLessonNumberChange}
                          placeholder="Enter duration in minutes"
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Order
                        </label>
                        <Input
                          name="order"
                          type="number"
                          value={currentLesson.order}
                          onChange={handleLessonNumberChange}
                          placeholder="Enter lesson order"
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content*
                      </label>
                      <Textarea
                        name="content"
                        value={currentLesson.content}
                        onChange={handleLessonChange}
                        placeholder="Enter lesson content"
                        className="w-full h-24"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      {isEditingLesson && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingLesson(false);
                            setEditingLessonIndex(null);
                            setCurrentLesson({
                              title: '',
                              content: '',
                              duration: 0,
                              order: lessons.length + 1,
                              videoUrl: '',
                            });
                          }}
                          className="mr-2"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        onClick={handleSaveLesson}
                        className="bg-[#8A63FF] hover:bg-[#7A53EF]"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isEditingLesson ? 'Update Lesson' : 'Add Lesson'}
                      </Button>
                    </div>
                  </div>
                  
                  {lessons.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lessons.map((lesson, index) => (
                          <TableRow key={index}>
                            <TableCell>{lesson.order}</TableCell>
                            <TableCell>{lesson.title}</TableCell>
                            <TableCell>{lesson.duration} min</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLesson(index)}
                                className="h-8 w-8 p-0 mr-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLesson(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No lessons added yet</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="quizzes">
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Course Quizzes</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-md font-medium mb-3">
                      {isEditingQuiz ? 'Edit Quiz' : 'Add New Quiz'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quiz Title*
                        </label>
                        <Input
                          name="title"
                          value={currentQuiz.title}
                          onChange={handleQuizChange}
                          placeholder="Enter quiz title"
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time Limit (minutes)*
                        </label>
                        <Input
                          name="timeLimit"
                          type="number"
                          value={currentQuiz.timeLimit}
                          onChange={handleQuizNumberChange}
                          placeholder="Enter time limit in minutes"
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passing Score (%)*
                        </label>
                        <Input
                          name="passingScore"
                          type="number"
                          value={currentQuiz.passingScore}
                          onChange={handleQuizNumberChange}
                          placeholder="Enter passing score percentage"
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div className="flex items-center mt-5">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={currentQuiz.isPublished}
                            onChange={(e) => handleQuizPublishedChange(e.target.checked)}
                            className="h-4 w-4 text-[#8A63FF] rounded border-gray-300 mr-2"
                          />
                          Published
                        </label>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <Textarea
                        name="description"
                        value={currentQuiz.description}
                        onChange={handleQuizChange}
                        placeholder="Enter quiz description"
                        className="w-full h-24"
                        required
                      />
                    </div>
                    
                    {/* Questions Section */}
                    {(currentQuiz.questions?.length || 0) > 0 && (
                      <div className="mt-6 mb-4">
                        <h5 className="text-sm font-semibold mb-2">Questions</h5>
                        <div className="border rounded-md overflow-hidden">
                          {currentQuiz.questions?.map((question, index) => (
                            <div key={index} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium">{index + 1}. {question.questionText}</span>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {question.options.length} options | {question.points} points
                                  </div>
                                </div>
                                <div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditQuestion(index)}
                                    className="h-7 w-7 p-0 mr-1"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(index)}
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Question Form */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-semibold mb-3">
                        {isEditingQuestion ? 'Edit Question' : 'Add New Question'}
                      </h5>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text*
                        </label>
                        <Input
                          name="questionText"
                          value={currentQuestion.questionText}
                          onChange={handleQuestionChange}
                          placeholder="Enter question text"
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points
                        </label>
                        <Input
                          name="points"
                          type="number"
                          value={currentQuestion.points}
                          onChange={handleQuestionPointsChange}
                          placeholder="Enter points value"
                          className="w-full max-w-[100px]"
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options*
                        </label>
                        
                        {currentQuestion.options?.map((option, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <Input
                              value={option.optionText}
                              onChange={(e) => handleOptionTextChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 mr-2"
                            />
                            <label className="flex items-center text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={(e) => handleOptionCorrectChange(index, e.target.checked)}
                                className="h-4 w-4 text-[#8A63FF] rounded border-gray-300 mr-1"
                              />
                              Correct
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                              className="h-7 w-7 p-0 ml-1 text-red-500 hover:text-red-700"
                              disabled={currentQuestion.options?.length <= 2}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddOption}
                          className="mt-1"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explanation (Optional)
                        </label>
                        <Textarea
                          name="explanation"
                          value={currentQuestion.explanation}
                          onChange={handleQuestionChange}
                          placeholder="Explain why the correct answer is right"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        {isEditingQuestion && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditingQuestion(false);
                              setEditingQuestionIndex(null);
                              setCurrentQuestion({
                                questionText: '',
                                options: [
                                  { optionText: '', isCorrect: false },
                                  { optionText: '', isCorrect: false }
                                ],
                                explanation: '',
                                points: 10
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={handleSaveQuestion}
                          className="bg-[#8A63FF] hover:bg-[#7A53EF]"
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          {isEditingQuestion ? 'Update Question' : 'Add Question'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleSaveQuiz}
                        className="bg-[#8A63FF] hover:bg-[#7A53EF]"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isEditingQuiz ? 'Update Quiz' : 'Save Quiz'}
                      </Button>
                    </div>
                  </div>
                  
                  {quizzes.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Questions</TableHead>
                          <TableHead>Time Limit</TableHead>
                          <TableHead>Passing Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quizzes.map((quiz, index) => (
                          <TableRow key={quiz._id}>
                            <TableCell className="font-medium">{quiz.title}</TableCell>
                            <TableCell>{quiz.questions?.length || 0}</TableCell>
                            <TableCell>{quiz.timeLimit} min</TableCell>
                            <TableCell>{quiz.passingScore}%</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${quiz.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {quiz.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditQuiz(index)}
                                className="h-8 w-8 p-0 mr-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteQuiz(quiz._id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No quizzes added yet</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="materials">
                <div className="bg-white rounded-lg">
                  <StudyMaterialsManager courseId={selectedCourse?._id || ''} />
                </div>
              </TabsContent>
              
              <TabsContent value="assignments">
                <div className="bg-white rounded-lg">
                  <AssignmentsManager courseId={selectedCourse?._id || ''} />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCourse}
                className="bg-[#8A63FF] hover:bg-[#7A53EF]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Course
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search courses..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div>
                      <Select
                        value={filterCategory}
                        onValueChange={(value) => setFilterCategory(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {uniqueCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select
                        value={filterLevel}
                        onValueChange={(value) => setFilterLevel(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course._id} className="overflow-hidden">
                      <div className="h-32 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${course.thumbnail || 'https://via.placeholder.com/400x200?text=Course'})` }}>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription className="mt-1">{course.category}</CardDescription>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge className="capitalize mb-1">{course.level}</Badge>
                            {course.category === 'AI Generated' && (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Generated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span className="font-medium mr-1">Price:</span> ${course.price}
                          {course.discount > 0 && 
                            <span className="text-green-600 ml-2">
                              {course.discount}% off
                            </span>
                          }
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-medium mr-1">Duration:</span> {course.duration} mins
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2 border-t">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => navigateToCourseDetails(course._id)}>
                            <LayoutDashboard className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigateToCourseStructure(course._id)}>
                            <BookOpen className="h-4 w-4 mr-1" />
                            Structure
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteCourse(course._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="py-12">
                  <CardContent className="flex flex-col items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">No courses found</h3>
                      <p className="text-gray-500 mb-4">
                        {courses.length > 0 
                          ? "No courses match your search criteria" 
                          : "Start by creating your first course"}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button onClick={handleCreateAICourse} className="bg-amber-500 hover:bg-amber-600">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create with AI
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCoursePage; 
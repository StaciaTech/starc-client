import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IQuiz, 
  IQuizQuestion, 
  IQuizSubmission, 
  IQuizResult,
  getQuizById,
  submitQuizAttempt 
} from '@/services/quizService';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Clock, Maximize, Minimize } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const QuizAttempt: React.FC = () => {
  const { quizId, courseId } = useParams<{ quizId: string; courseId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<IQuizResult | null>(null);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [fullScreenWarning, setFullScreenWarning] = useState<boolean>(false);
  
  // Load quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      
      try {
        setLoading(true);
        const quizData = await getQuizById(quizId);
        setQuiz(quizData);
        
        // Initialize time remaining
        setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId]);

  // Request full screen when quiz loads
  useEffect(() => {
    if (!loading && quiz && !quizCompleted) {
      requestFullScreen();
    }
  }, [loading, quiz, quizCompleted]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).mozFullScreenElement || 
        (document as any).msFullscreenElement
      );

      setIsFullScreen(isCurrentlyFullScreen);
      
      // Show warning if exited fullscreen during quiz
      if (!isCurrentlyFullScreen && !quizCompleted && quiz) {
        setFullScreenWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, [quiz, quizCompleted]);
  
  // Timer countdown
  useEffect(() => {
    if (!quiz || quizCompleted || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quiz, quizCompleted, timeRemaining]);

  // Request full screen
  const requestFullScreen = () => {
    if (containerRef.current) {
      try {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          (containerRef.current as any).msRequestFullscreen();
        }
        setFullScreenWarning(false);
      } catch (err) {
        console.error('Error requesting fullscreen:', err);
        toast.error('Failed to enter fullscreen mode. Please try again.');
      }
    }
  };

  // Exit full screen
  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (isFullScreen) {
      exitFullScreen();
    } else {
      requestFullScreen();
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle time up
  const handleTimeUp = () => {
    toast.error('Time is up! Your quiz will be submitted automatically.');
    handleSubmitQuiz();
  };
  
  // Get current question
  const getCurrentQuestion = (): IQuizQuestion | null => {
    if (!quiz) return null;
    return quiz.questions[currentQuestionIndex];
  };
  
  // Handle radio selection (single answer)
  const handleRadioSelection = (optionIndex: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: [optionIndex]
    }));
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!quiz || !quizId || !courseId) return;
    
    try {
      setIsSubmitting(true);
      
      // Format answers for submission according to IQuizSubmission interface
      const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedOptions]) => ({
        questionIndex: parseInt(questionIndex),
        selectedOptionIndex: parseInt(selectedOptions[0])
      }));
      
      const submission: IQuizSubmission = {
        answers: formattedAnswers,
        timeTaken: quiz.timeLimit * 60 - timeRemaining // Calculate time taken in seconds
      };
      
      const result = await submitQuizAttempt(quizId, submission);
      setQuizResult(result);
      setQuizCompleted(true);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle quiz completion
  const handleFinishQuiz = () => {
    // Exit fullscreen when finishing the quiz
    if (isFullScreen) {
      exitFullScreen();
    }
    navigate(`/course/${courseId}/learning`);
  };
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!quiz) return 0;
    return Math.round((Object.keys(answers).length / quiz.questions.length) * 100);
  };
  
  // Render quiz completion screen
  const renderQuizCompletion = () => {
    if (!quizResult) return null;
    
    const { score, maxScore, percentage, passed: isPassed } = quizResult;
    const correctAnswers = Math.round((score / maxScore) * quiz!.questions.length);
    const totalQuestions = quiz!.questions.length;
    
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Completed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {isPassed ? (
              <div className="bg-green-100 text-green-800 p-6 rounded-lg mb-6">
                <Check className="h-16 w-16 mx-auto mb-2 text-green-600" />
                <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                <p>You've passed the quiz successfully.</p>
              </div>
            ) : (
              <div className="bg-red-100 text-red-800 p-6 rounded-lg mb-6">
                <AlertCircle className="h-16 w-16 mx-auto mb-2 text-red-600" />
                <h3 className="text-xl font-bold mb-2">Keep Practicing</h3>
                <p>You didn't pass this time, but you can try again.</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-1">Your Score</p>
              <p className="text-2xl font-bold">{score} / {maxScore}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-1">Percentage</p>
              <p className="text-2xl font-bold">{percentage}%</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-1">Correct Answers</p>
              <p className="text-2xl font-bold">{correctAnswers} / {totalQuestions}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-1">Status</p>
              <p className="text-2xl font-bold">
                {isPassed ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Passed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                    Failed
                  </Badge>
                )}
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              className="bg-[#8A63FF] hover:bg-[#7A53EF]"
              onClick={handleFinishQuiz}
            >
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Check if question has been answered
  const isQuestionAnswered = (questionIndex: number): boolean => {
    return !!answers[questionIndex] && answers[questionIndex].length > 0;
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]" ref={containerRef}>
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  
  // Render quiz completion screen
  if (quizCompleted && quizResult) {
    return (
      <div ref={containerRef} className="min-h-screen p-4 bg-gray-50">
        {renderQuizCompletion()}
      </div>
    );
  }
  
  // Render quiz not found
  if (!quiz) {
    return (
      <div className="text-center p-8" ref={containerRef}>
        <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
        <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate(`/course/${courseId}/learning`)}>
          Back to Course
        </Button>
      </div>
    );
  }
  
  // Get current question
  const currentQuestion = getCurrentQuestion();
  
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {fullScreenWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>This quiz requires fullscreen mode. Please enter fullscreen to continue.</span>
                <Button size="sm" onClick={requestFullScreen} className="ml-2 bg-red-600 hover:bg-red-700">
                  Enter Fullscreen
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2" 
                onClick={toggleFullScreen}
                title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <p className="text-gray-600">
              Progress: {calculateProgress()}%
            </p>
          </div>
          
          <Progress value={calculateProgress()} className="w-full h-2" />
        </div>
        
        {currentQuestion && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentQuestion.questionText}
              </h2>
              
              <div className="my-6">
                <RadioGroup
                  value={answers[currentQuestionIndex]?.[0] || ''}
                  onValueChange={handleRadioSelection}
                  className="w-full space-y-4"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <div className="flex items-center w-full">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mr-2" />
                        <label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option.optionText}
                        </label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              disabled={!isQuestionAnswered(currentQuestionIndex)}
              className="bg-[#8A63FF] hover:bg-[#7A53EF] flex items-center"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={!isQuestionAnswered(currentQuestionIndex) || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          )}
        </div>
        
        <div className="mt-8">
          <Separator />
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {quiz.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={isQuestionAnswered(index) ? "default" : "outline"}
                  size="sm"
                  className={
                    index === currentQuestionIndex
                      ? "ring-2 ring-[#8A63FF] " + (isQuestionAnswered(index) ? "bg-[#8A63FF]" : "")
                      : isQuestionAnswered(index)
                      ? "bg-[#8A63FF] hover:bg-[#7A53EF]"
                      : ""
                  }
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt; 
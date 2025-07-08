/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IQuiz,
  IQuizQuestion,
  IQuizSubmission,
  IQuizResult,
  getQuizById,
  submitQuizAttempt,
} from "@/services/quizService";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Clock,
  Maximize,
  Minimize,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const QuizAttempt: React.FC = () => {
  const { quizId, courseId } = useParams<{
    quizId: string;
    courseId: string;
  }>();
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
  const [showExitConfirmation, setShowExitConfirmation] =
    useState<boolean>(false);

  // Load quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;

      // Check if fullscreen is active

      const isFullScreenActive = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isFullScreenActive) {
        toast.error("Quiz must be opened in fullscreen mode");
        navigate(`/course/${courseId}/learning`);
      }

      try {
        setLoading(true);
        const quizData = await getQuizById(quizId);
        setQuiz(quizData);
        setTimeRemaining(quizData.timeLimit * 60); // in seconds
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  

  // request fullscreen on load
  useEffect(() => {
    if (!loading && quiz && !quizCompleted) {
      requestFullScreen();
    }
  }, [loading, quiz, quizCompleted]);

  // push dummy state to control history
  useEffect(() => {
    if (!loading && quiz && !quizCompleted) {
      window.history.pushState(null, "", window.location.href);
    }
  }, [loading, quiz, quizCompleted]);

  // listen for fullscreen exit
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullScreen(isCurrentlyFullScreen);

      // Immediately submit quiz if the user exits full screen
      if (!isCurrentlyFullScreen && !quizCompleted && quiz) {
        toast.error("You exited fullscreen The quiz has been terminated.");
        handleSubmitQuiz();
        // setShowExitConfirmation(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
  }, [quiz, quizCompleted]);

  // Prevent Tab switch
  useEffect(()=>{
    const handleVisibilityChange = ()=>{
      if(document.hidden && !quizCompleted && quiz){
        toast.error('Tab switch detected. The quiz has been terminated');
        handleSubmitQuiz();
      }
    }
    document.addEventListener('visibilitychange',handleVisibilityChange);
    return ()=> {
      document.removeEventListener('visibilitychange',handleVisibilityChange);
    }
  },[quiz, quizCompleted]);

  // // catch back/forward swipe (popstate)
  // useEffect(() => {
  //   const handlePopState = () => {
  //     window.history.pushState(null, '', window.location.href);
  //     setShowExitConfirmation(true);
  //   };
  //   window.addEventListener('popstate', handlePopState);
  //   return () => window.removeEventListener('popstate', handlePopState);
  // }, [quiz, quizCompleted]);

  // timer
  useEffect(() => {
    if (!quiz || quizCompleted || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
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

  // Disable Right Click (Context menu)

  useEffect(() => {
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleRightClick);

    return () => document.removeEventListener("contextmenu", handleRightClick);
  }, []);

  // Block Copy + Keyboard Shortcuts

  const blockKeyActions = (e: KeyboardEvent) => {
    // Disable F12, Ctrl+Shift+I, Ctrl+shift+J, Ctrl+U
    if (
      e.key == "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key)) ||
      (e.ctrlKey && e.key === "u")
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const disableCopyPaste = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener("keydown", blockKeyActions);
    document.addEventListener("copy", disableCopyPaste);
    document.addEventListener("cut", disableCopyPaste);
    document.addEventListener("paste", disableCopyPaste);

    return () => {
      document.removeEventListener("keydown", blockKeyActions);
      document.removeEventListener("copy", disableCopyPaste);
      document.removeEventListener("cut", disableCopyPaste);
      document.removeEventListener("paste", disableCopyPaste);
    };
  },[]);

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
        console.error("Error requesting fullscreen:", err);
        toast.error("Failed to enter fullscreen mode. Please try again.");
      }
    }
  };

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

  const toggleFullScreen = () => {
    if (isFullScreen) {
      exitFullScreen();
    } else {
      requestFullScreen();
    }
  };

  const handleTimeUp = () => {
    toast.error("Time is up! Submitting automatically...");
    handleSubmitQuiz();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getCurrentQuestion = (): IQuizQuestion | null => {
    if (!quiz) return null;
    return quiz.questions[currentQuestionIndex];
  };

  const handleRadioSelection = (optionIndex: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: [optionIndex],
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quizId || !courseId) return;
    try {
      setIsSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(
        ([qIndex, selected]) => ({
          questionIndex: parseInt(qIndex),
          selectedOptionIndex: parseInt(selected[0]),
        })
      );
      const submission: IQuizSubmission = {
        answers: formattedAnswers,
        timeTaken: quiz.timeLimit * 60 - timeRemaining,
      };
      const result = await submitQuizAttempt(quizId, submission);
      setQuizResult(result);
      setQuizCompleted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishQuiz = () => {
    if (isFullScreen) exitFullScreen();
    navigate(`/course/${courseId}/learning`);
  };

  const calculateProgress = () => {
    if (!quiz) return 0;
    return Math.round(
      (Object.keys(answers).length / quiz.questions.length) * 100
    );
  };

  const isQuestionAnswered = (questionIndex: number) => {
    return !!answers[questionIndex]?.length;
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-[50vh]"
        ref={containerRef}
      >
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center p-8" ref={containerRef}>
        <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
        <p className="text-gray-600 mb-4">The quiz is not available.</p>
        <Button onClick={() => navigate(`/course/${courseId}/learning`)}>
          Back to Course
        </Button>
      </div>
    );
  }

  if (quizCompleted && quizResult) {
    const { score, maxScore, percentage, passed } = quizResult;
    return (
      <div ref={containerRef} className="min-h-screen p-4 bg-gray-50">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            {passed ? (
              <div className="bg-green-100 text-green-800 p-6 rounded-lg mb-6">
                <Check className="h-16 w-16 mx-auto mb-2 text-green-600" />
                <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                <p>You passed the quiz successfully.</p>
              </div>
            ) : (
              <div className="bg-red-100 text-red-800 p-6 rounded-lg mb-6">
                <AlertCircle className="h-16 w-16 mx-auto mb-2 text-red-600" />
                <h3 className="text-xl font-bold mb-2">Try Again</h3>
                <p>You did not pass this time.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Score:</strong> {score}/{maxScore}
              </div>
              <div>
                <strong>Percentage:</strong> {percentage}%
              </div>
            </div>
            <Button
              onClick={handleFinishQuiz}
              className="bg-[#8A63FF] hover:bg-[#7A53EF]"
            >
              Continue Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-orange-500" />
            <span>{formatTime(timeRemaining)}</span>
            <Button onClick={toggleFullScreen} size="sm" variant="outline">
              {isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {fullScreenWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <span>This quiz requires fullscreen mode.</span>
              <Button
                onClick={requestFullScreen}
                size="sm"
                className="ml-4 bg-red-600 hover:bg-red-700"
              >
                Enter Fullscreen
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Progress value={calculateProgress()} className="mb-4" />

        {currentQuestion && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <h2 className="text-xl mb-4">{currentQuestion.questionText}</h2>
              <RadioGroup
                value={answers[currentQuestionIndex]?.[0] || ""}
                onValueChange={handleRadioSelection}
                className="space-y-4"
              >
                {currentQuestion.options.map((opt, i) => (
                  <div
                    key={i}
                    className="border p-3 rounded hover:bg-gray-50 flex items-start"
                  >
                    <RadioGroupItem
                      value={i.toString()}
                      id={`option-${i}`}
                      className="mr-2"
                    />
                    <label htmlFor={`option-${i}`} className="cursor-pointer">
                      {opt.optionText}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-4">
          <Button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              disabled={!isQuestionAnswered(currentQuestionIndex)}
              className="bg-[#8A63FF] hover:bg-[#7A53EF]"
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={
                !isQuestionAnswered(currentQuestionIndex) || isSubmitting
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                "Submit Quiz"
              )}
            </Button>
          )}
        </div>

        {/* exit confirmation dialog */}
        {/* <Dialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Quiz?</DialogTitle>
            <DialogDescription>
              Leaving this page will end your quiz attempt. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowExitConfirmation(false);
              requestFullScreen();
            }}>
              Stay
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleFinishQuiz}>
              Exit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
      </div>
    </div>
  );
};

export default QuizAttempt;

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  submitQuizAttempt,
  IQuizSubmission,
  IQuizResult,
} from "@/services/quizService";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
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
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// --- API Types ---
interface IAPIQuestion {
  _id?: string;
  question?: string;
  questionText?: string;
  title?: string;
  options: string[];
  points: number;
  correctAnswer: number;
}

interface IAPIQuiz {
  _id: string;
  title: string;
  timeLimit: number;
  questions: IAPIQuestion[];
  passingScore: number;
}

type QuizStatus =
  | "loading"
  | "active"
  | "submitting"
  | "completed"
  | "error"
  | "terminated";

const QuizAttempt: React.FC = () => {
  const { quizId, courseId } = useParams<{
    quizId: string;
    courseId: string;
  }>();
  const navigate = useNavigate();

  // We use this ref to detect if the component is mounted
  const isMounted = useRef(true);

  // --- Refs for Logic ---
  const submissionInProgress = useRef(false);
  const endTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- State ---
  const [status, setStatus] = useState<QuizStatus>("loading");
  const [quiz, setQuiz] = useState<IAPIQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<IQuizResult | null>(null);

  // --- Dialog States ---
  const [fullScreenWarning, setFullScreenWarning] = useState<boolean>(true);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // --- 1. Fetch Quiz ---
  const fetchAllQuiz = async () => {
    try {
      setStatus("loading");
      if (!courseId || !quizId) throw new Error("Missing params");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quizzes/course/${courseId}/subchapter?subchapterId=${quizId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch quiz");

      const responseData = await res.json();

      if (
        responseData.success &&
        responseData.data &&
        responseData.data.length > 0
      ) {
        const quizData = responseData.data[0];

        if (!quizData.questions || quizData.questions.length === 0) {
          toast.error("This quiz has no questions.");
          setStatus("error");
          return;
        }

        if (isMounted.current) {
          setQuiz(quizData);
          const timeLimit = quizData.timeLimit || 10;
          const durationMs = timeLimit * 60 * 1000;
          endTimeRef.current = Date.now() + durationMs;
          setTimeRemaining(timeLimit * 60);
          setStatus("active");

          // Lock navigation history
          window.history.pushState(null, "", window.location.href);
        }
      } else {
        toast.error("No quiz found for this section.");
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading quiz. Please try again.");
      setStatus("error");
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchAllQuiz();
    return () => {
      isMounted.current = false;
      clearTimer();
    };
  }, []);

  // --- 2. Timer Logic ---
  const clearTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  useEffect(() => {
    if (status !== "active" || !endTimeRef.current) return;

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const msRemaining = endTimeRef.current! - now;
      const secondsRemaining = Math.ceil(msRemaining / 1000);

      if (secondsRemaining <= 0) {
        clearTimer();
        if (isMounted.current) setTimeRemaining(0);
        handleSubmitQuiz(true); // Auto-submit
      } else {
        if (isMounted.current) setTimeRemaining(secondsRemaining);
      }
    }, 1000);

    return () => clearTimer();
  }, [status]);

  // --- 3. Security: Fullscreen & Visibility Enforcement ---
  const handleSecurityViolation = useCallback(
    (reason: string) => {
      // Ignore if already submitting or finished
      if (status !== "active" || submissionInProgress.current) return;

      setStatus("terminated");
      clearTimer();

      toast.error(reason, {
        duration: 4000,
        icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
        style: {
          border: "1px solid #ef4444",
          background: "#fef2f2",
          color: "#b91c1c",
        },
      });

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      // Delay navigation slightly so user sees the error
      setTimeout(() => {
        navigate(`/course/${courseId}/learning`, { replace: true });
      }, 2500);
    },
    [status, courseId, navigate],
  );

  useEffect(() => {
    const handleFullScreenChange = () => {
      // If we lose fullscreen AND we are active AND we passed the initial warning
      if (
        !document.fullscreenElement &&
        status === "active" &&
        !fullScreenWarning
      ) {
        handleSecurityViolation("Fullscreen exited! Quiz suspended.");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && status === "active" && !fullScreenWarning) {
        handleSecurityViolation("Tab switched! Quiz suspended.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, fullScreenWarning, handleSecurityViolation]);

  // --- 4. Submission Logic (Direct API Call) ---
  const handleSubmitQuiz = async (autoSubmit = false) => {
    // 1. Guard clauses
    if (submissionInProgress.current) return;

    // Ensure we have the real Quiz ID from the loaded data, NOT the URL param
    if (!quiz || !quiz._id) {
      toast.error("Quiz data is missing. Cannot submit.");
      return;
    }

    try {
      submissionInProgress.current = true;
      setStatus("submitting");
      clearTimer();

      if (autoSubmit) toast.info("Time up! Submitting answers...");

      // 2. Format Answers & Validate
      const formattedAnswers = Object.entries(answers)
        .map(([key, selectedIdx]) => {
          const qIndex = parseInt(key);
          const questionObj = quiz.questions[qIndex];

          if (!questionObj) return null;

          return {
            questionIndex: qIndex,
            selectedOptionIndex: selectedIdx,
            // CRITICAL: Send the Question ID for backend validation
            questionId: questionObj._id,
          };
        })
        .filter(Boolean); // Remove nulls

      // 3. Calculate Time Taken
      let timeTaken = 0;
      if (endTimeRef.current) {
        const durationSeconds = (quiz.timeLimit || 10) * 60;
        const elapsed =
          (Date.now() - (endTimeRef.current - durationSeconds * 1000)) / 1000;
        timeTaken = Math.min(elapsed, durationSeconds);
      }

      // 4. Payload
      const payload = {
        answers: formattedAnswers,
        timeTaken: Math.floor(timeTaken),
      };

      console.log(
        "🚀 Submitting Payload to:",
        `/api/quizzes/${quiz._id}/attempt`,
      );

      // 5. DIRECT API CALL
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quizzes/${quiz._id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.message || "Failed to submit quiz");
      }

      // 6. Success Handling
      setQuizResult(resultData.data); // Extract the actual data payload
      setStatus("completed");
      toast.success("Quiz submitted successfully!");

      // Exit fullscreen cleanup
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message || "Submission failed. Please try again.");

      // Reset state so user can retry
      submissionInProgress.current = false;
      setStatus("active");
    }
  };

  // --- Helpers ---
  const requestFullScreen = async () => {
    try {
      // FIX: Use document.documentElement instead of containerRef
      // This ensures standard Shadcn/Radix Dialogs (which portal to body) are visible
      await document.documentElement.requestFullscreen();
      setFullScreenWarning(false);
    } catch {
      toast.error("Fullscreen blocked. Please click 'Start' again.");
    }
  };

  const handleOptionSelect = (idx: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: idx }));
  };

  const formatTimeStr = (seconds: number) => {
    if (seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- RENDER ---

  // 1. Loading
  if (status === "loading") {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <Spinner className="h-10 w-10 text-[#8A63FF] mb-4" />
        <p className="text-gray-500">Preparing secure quiz environment...</p>
      </div>
    );
  }

  // 2. Error or Terminated
  if (status === "error" || status === "terminated" || !quiz) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center p-8 border-red-100 shadow-lg">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {status === "terminated" ? "Quiz Suspended" : "Unable to Load Quiz"}
          </h2>
          <p className="text-gray-600 mb-6">
            {status === "terminated"
              ? "You exited the secure environment. Your attempt has been suspended and you are being redirected."
              : "The quiz data could not be retrieved."}
          </p>
          <Button
            onClick={() => navigate(`/course/${courseId}/learning`)}
            variant="outline"
          >
            Return to Course
          </Button>
        </Card>
      </div>
    );
  }

  // 3. Results (Passed/Failed)
  if (status === "completed" && quizResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-xl w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {quizResult.passed ? (
              <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            ) : (
              <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {quizResult.passed ? "Quiz Passed!" : "Quiz Failed"}
              </h2>
              <p className="text-gray-500 mt-1">
                You scored {quizResult.percentage}% ({quizResult.score}/
                {quizResult.maxScore})
              </p>
            </div>

            <Button
              className="w-full bg-[#8A63FF] hover:bg-[#7a53ef]"
              onClick={() => navigate(`/course/${courseId}/learning`)}
            >
              Return to Module
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Active Quiz Interface
  const question = quiz.questions[currentQuestionIndex];
  // Fallback for missing text fields based on unstable API
  const questionText =
    question.question ||
    question.questionText ||
    question.title ||
    "Question text unavailable";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* FULLSCREEN WARNING MODAL
        Note: z-[9999] is used to ensure visibility 
      */}
      <Dialog open={fullScreenWarning} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md z-[9999]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Maximize className="h-5 w-5" /> Proctored Mode
            </DialogTitle>
            <DialogDescription>
              This quiz requires fullscreen.{" "}
              <b>
                Exiting fullscreen or switching tabs will immediately suspend
                the quiz.
              </b>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Exit
            </Button>
            {/* Starts Fullscreen on Document Level */}
            <Button onClick={requestFullScreen} className="bg-[#8A63FF]">
              Start Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUBMIT CONFIRMATION MODAL
        Problem Solved: Since we fullscreen the documentElement, 
        this portal (which attaches to body) is now visible.
      */}
      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent className="z-[9999]">
          <DialogHeader>
            <DialogTitle>Finish Quiz?</DialogTitle>
            <DialogDescription>
              You have answered {Object.keys(answers).length} of{" "}
              {quiz.questions.length} questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowSubmitConfirm(false);
                handleSubmitQuiz();
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content Area */}
      {!fullScreenWarning && (
        <div className="container max-w-4xl mx-auto p-4 py-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white rounded-lg p-4 shadow-sm border mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="font-bold text-gray-900">{quiz.title}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span>
                  Question {currentQuestionIndex + 1} / {quiz.questions.length}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-red-50 text-red-600 border-red-100"
                >
                  <ShieldAlert className="h-3 w-3 mr-1" /> Monitored
                </Badge>
              </div>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 font-mono font-bold text-lg text-[#8A63FF]">
              <Clock className="h-5 w-5" />
              {formatTimeStr(timeRemaining)}
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            value={(Object.keys(answers).length / quiz.questions.length) * 100}
            className="h-2 mb-6"
          />

          {/* Question Card */}
          <Card className="flex-1 shadow-md border-t-4 border-t-[#8A63FF]">
            <CardContent className="p-6 sm:p-10">
              <h2 className="text-xl font-medium text-gray-900 mb-8">
                {questionText}
              </h2>

              <RadioGroup
                value={answers[currentQuestionIndex]?.toString() ?? ""}
                onValueChange={(val) => handleOptionSelect(parseInt(val))}
                className="space-y-3"
              >
                {question.options.map((optString, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestionIndex] === idx
                        ? "border-[#8A63FF] bg-purple-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <RadioGroupItem
                      value={idx.toString()}
                      className="mt-1 mr-3 text-[#8A63FF]"
                    />
                    <span className="text-gray-700 font-medium select-none">
                      {optString}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              disabled={currentQuestionIndex === 0 || status === "submitting"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                className="bg-[#8A63FF] hover:bg-[#7a53ef]"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={status === "submitting"}
              >
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;

import React, { useState, useEffect, useRef } from "react";
import { assessmentService } from "@/services/assessmentService";
import { toast } from "sonner";
import { Lock, CheckCircle, XCircle, ArrowRight, Shield, Maximize, AlertTriangle } from "lucide-react";

interface EntranceTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onPass: () => void;
}

interface Question {
  _id: string;
  question: string;
  options: string[];
}

const EntranceTestModal: React.FC<EntranceTestModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onPass,
}) => {
  const [phase, setPhase] = useState<"instructions" | "testing" | "result">("instructions");
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<{
    questions: Question[];
    passingScore: number;
    title: string;
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    correctCount: number;
    totalQuestions: number;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visited, setVisited] = useState<boolean[]>([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const testActiveRef = useRef(false);

  // Timer
  useEffect(() => {
    if (phase !== "testing" || !testData) return;
    const timer = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [phase, testData]);

  // Track visited questions
  useEffect(() => {
    if (testData && phase === "testing") {
      setVisited((prev) => {
        const updated = [...prev];
        updated[currentQuestionIndex] = true;
        return updated;
      });
    }
  }, [currentQuestionIndex, testData, phase]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase("instructions");
      setResult(null);
      setError(null);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setVisited([]);
      setSecondsElapsed(0);
      setTestData(null);
      testActiveRef.current = false;
    }
  }, [isOpen]);

  // ===== CHEAT DETECTION: Only active during 'testing' phase =====
  useEffect(() => {
    if (phase !== "testing") {
      testActiveRef.current = false;
      return;
    }

    testActiveRef.current = true;

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && testActiveRef.current) {
        failTest("Test terminated: You exited full screen mode.");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && testActiveRef.current) {
        failTest("Test terminated: You switched tabs/windows.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [phase]);

  const enterFullScreen = async (): Promise<boolean> => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      return true;
    } catch (err) {
      console.error("Error attempting to enable full-screen mode:", err);
      return false;
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
  };

  // ===== START TEST: User clicks button → enter full screen → load questions =====
  const handleStartTest = async () => {
    // Enter full screen first (triggered by user gesture = will work!)
    const success = await enterFullScreen();
    if (!success) {
      toast.error("Full screen is required for this test. Please allow it and try again.");
      return;
    }

    // Load test data
    setLoading(true);
    setError(null);
    try {
      const status = await assessmentService.getQualificationStatus(courseId);
      if (status.qualified) {
        exitFullScreen();
        onPass();
        onClose();
        return;
      }
      const data = await assessmentService.getEntranceTest(courseId);
      setTestData(data as any);
      setVisited(Array((data as any).questions.length).fill(false));
      setPhase("testing"); // Now enter testing phase
    } catch (err: any) {
      console.error("Failed to load test:", err);
      setError(err.response?.data?.message || "Failed to load entrance test.");
      exitFullScreen();
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (!testData) return;
    const currentQuestion = testData.questions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: option,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (testData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const submitTest = async () => {
    setSubmitting(true);
    testActiveRef.current = false; // Stop cheat detection before result
    try {
      const res = await assessmentService.submitEntranceTest(courseId, answers);
      setResult({
        passed: res.passed,
        score: res.score,
        correctCount: res.correctCount,
        totalQuestions: res.totalQuestions,
        message: res.message,
      });
      setPhase("result");
      // Don't exit fullscreen here — show result inside fullscreen
      if (res.passed) {
        toast.success("Congratulations! You passed the entrance test.");
      } else {
        toast.error("You did not pass. Please try again.");
      }
    } catch (err: any) {
      toast.error("Failed to submit test.");
    } finally {
      setSubmitting(false);
    }
  };

  const failTest = (reason: string) => {
    testActiveRef.current = false;
    setResult({
      passed: false,
      score: 0,
      correctCount: 0,
      totalQuestions: testData?.questions.length || 0,
      message: reason,
    });
    setPhase("result");
    // Don't exit fullscreen here — show result inside fullscreen
  };

  const handleExit = () => {
    testActiveRef.current = false;
    exitFullScreen();
    onClose();
  };

  const handleRetry = () => {
    setResult(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
    setVisited([]);
    setSecondsElapsed(0);
    setTestData(null);
    setPhase("instructions");
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600).toString().padStart(2, "0");
    const mins = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const sec = (secs % 60).toString().padStart(2, "0");
    return `${hours}:${mins}:${sec}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQ = testData?.questions.length || 0;
  const progressPercent = totalQ > 0 ? (answeredCount / totalQ) * 100 : 0;

  const getStatusColor = (index: number) => {
    const qId = testData?.questions[index]?._id || "";
    if (answers[qId]) return "bg-purple-600 border-purple-600 text-white";
    if (visited[index]) return "border-purple-400 text-black bg-white";
    return "bg-gray-200 text-black border-gray-200";
  };

  const getOptionLetter = (option: string) => {
    const match = option.match(/^([A-Za-z])[.\s:]/);
    return match ? match[1].toUpperCase() : "";
  };

  if (!isOpen) return null;

  // ===== PHASE: INSTRUCTIONS (before entering full screen) =====
  if (phase === "instructions") {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center font-mont">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Entrance Test</h2>
              <p className="text-sm text-gray-500">{courseTitle}</p>
            </div>
          </div>

          {error ? (
            <div className="text-center py-6">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 mb-6">{error}</p>
              <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 text-sm mb-2">Important Rules</h3>
                    <ul className="text-sm text-amber-700 space-y-1.5">
                      <li>• The test will run in <strong>full screen mode</strong></li>
                      <li>• <strong>Exiting full screen</strong> will terminate the test</li>
                      <li>• <strong>Switching tabs</strong> will terminate the test</li>
                      <li>• You need <strong>80%</strong> to pass</li>
                      <li>• 5 random questions will be presented</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartTest}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  {loading ? (
                    "Loading..."
                  ) : (
                    <>
                      <Maximize className="w-4 h-4" />
                      Start Test
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== PHASE: RESULT (shown inside fullscreen) =====
  if (phase === "result" && result) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 flex items-center justify-center font-mont">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in duration-300 text-center">
          {result.passed ? (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h3>
              <p className="text-gray-600 mb-1">You passed the entrance test!</p>
              <p className="text-4xl font-bold text-purple-600 my-3">{result.score.toFixed(0)}%</p>
              <p className="text-gray-500 text-sm mb-1">{result.correctCount} / {result.totalQuestions} Correct</p>
              <p className="text-gray-400 text-xs mb-6">Time: {formatTime(secondsElapsed)}</p>
              <button
                onClick={() => { exitFullScreen(); onPass(); onClose(); }}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Proceed to Enrollment <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Test Failed</h3>
              <p className="text-gray-600 mb-1">{result.message}</p>
              <p className="text-4xl font-bold text-red-500 my-3">{result.score.toFixed(0)}%</p>
              <p className="text-gray-500 text-sm mb-1">{result.correctCount} / {result.totalQuestions} Correct</p>
              <p className="text-gray-400 text-xs mb-6">Time: {formatTime(secondsElapsed)}</p>
              <div className="flex gap-3">
                <button onClick={() => { exitFullScreen(); onClose(); }} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Exit
                </button>
                <button onClick={() => { exitFullScreen(); handleRetry(); }} className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== PHASE: TESTING (Full screen quiz layout) =====
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col font-mont">
      {/* Top Header Bar */}
      <div className="bg-[#8A63FF] px-6 py-3 text-white flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Entrance Test</h1>
            <p className="text-white/80 text-xs">{courseTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs bg-white/20 px-3 py-1.5 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            Full Screen Enforced
          </div>
        </div>
      </div>

      {/* Two-column quiz layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Quiz Content (4/6) */}
        <div className="w-full md:w-4/6 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 h-full flex flex-col">
            {/* Title + Progress */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">{courseTitle} - Entrance Test</h2>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{Math.round(progressPercent)}% completed</p>
            </div>

            {/* Question Header */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold">
                Question {currentQuestionIndex + 1}:
              </p>
              <div className="text-sm flex items-center space-x-1">
                <span>🕐</span>
                <span className="text-green-600 font-semibold">{formatTime(secondsElapsed)}</span>
              </div>
            </div>

            {/* Question Text */}
            {testData?.questions[currentQuestionIndex] && (
              <>
                <p className="text-gray-700 mb-6 text-base leading-relaxed">
                  {testData.questions[currentQuestionIndex].question}
                </p>

                {/* Options */}
                <div className="space-y-4 flex-grow">
                  {testData.questions[currentQuestionIndex].options.map((option, idx) => {
                    const letter = getOptionLetter(option);
                    const isSelected = answers[testData.questions[currentQuestionIndex]._id] === option;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-purple-50 border-purple-300"
                            : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
                        }`}
                        onClick={() => handleOptionSelect(option)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border flex-shrink-0 transition-colors ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-600"
                              : "text-purple-600 border-purple-600"
                          }`}
                        >
                          {letter}
                        </div>
                        <p className={`${isSelected ? "font-medium text-purple-700" : "text-gray-700"}`}>
                          {option}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 items-center pt-6 mt-auto border-t border-gray-100">
              <button
                className="px-6 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              {currentQuestionIndex === totalQ - 1 ? (
                <button
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  onClick={submitTest}
                  disabled={submitting || answeredCount < totalQ}
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                </button>
              ) : (
                <button
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={handleNext}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar (2/5) */}
        <div className="w-full md:w-2/5 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-md p-7 h-full flex flex-col">
            <h2 className="font-bold text-lg mb-4">Section: Questions</h2>

            {/* Question number grid */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {testData?.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-full border font-semibold flex items-center justify-center text-sm transition-all ${getStatusColor(index)} ${
                    currentQuestionIndex === index ? "ring-2 ring-purple-400 ring-offset-2" : ""
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-6 mt-auto pt-4 border-t border-gray-100">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white border border-purple-600 text-xs font-bold">
                  A
                </div>
                <span className="text-xs mt-1.5 text-gray-500">Answered</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-purple-400 flex items-center justify-center text-black text-xs font-bold bg-white">
                  A
                </div>
                <span className="text-xs mt-1.5 text-gray-500">Viewed</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-black text-xs font-bold">
                  A
                </div>
                <span className="text-xs mt-1.5 text-gray-500">Not Viewed</span>
              </div>
            </div>

            {/* Pass info & Exit */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Pass Mark:</span>
                <span className="text-sm font-semibold text-green-600">{testData?.passingScore}%</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Answered:</span>
                <span className="text-sm font-semibold text-purple-600">{answeredCount} / {totalQ}</span>
              </div>
              <button
                onClick={handleExit}
                className="w-full px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 text-sm transition-colors"
              >
                Exit Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntranceTestModal;

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { assessmentService } from "@/services/assessmentService";
import { toast } from "sonner";
import { Lock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

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
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (isOpen && courseId) {
      loadTest();
    }
  }, [isOpen, courseId]);

  const loadTest = async () => {
    setLoading(true);
    setError(null);
    try {
      // First check if already qualified
      const status = await assessmentService.getQualificationStatus(courseId);
      if (status.qualified) {
        onPass();
        onClose();
        return;
      }

      const data = await assessmentService.getEntranceTest(courseId);
      setTestData(data as any);
    } catch (err: any) {
      console.error("Failed to load test:", err);
      setError(err.response?.data?.message || "Failed to load entrance test. Please try again later.");
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
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const res = await assessmentService.submitEntranceTest(courseId, answers);
      setResult({
        passed: res.passed,
        score: res.score,
        correctCount: res.correctCount,
        totalQuestions: res.totalQuestions,
        message: res.message,
      });
      if (res.passed) {
        toast.success("Congratulations! You passed the entrance test.");
        setTimeout(() => {
          onPass();
          onClose();
        }, 2000);
      } else {
        toast.error("You did not pass. Please try again.");
      }
    } catch (err: any) {
      toast.error("Failed to submit test.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Cheat Detection Logic */
  useEffect(() => {
    if (!isOpen) return;

    // 1. Enter Full Screen Logic
    const enterFullScreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) { /* IE11 */
          await (elem as any).msRequestFullscreen();
        }
      } catch (err) {
        console.error("Error attempting to enable full-screen mode:", err);
      }
    };
    
    // Only attempt full screen if we are not showing results/errors and data is loaded (or loading)
    if (!result && !error) {
       enterFullScreen();
    }

    // 2. Full Screen Change Listener
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && !result && !error) {
        // User exited full screen - FAIL THE TEST
        failTest("Test terminated: You exited full screen mode.");
      }
    };

    // 3. Visibility Change (Tab Switch) Listener
    const handleVisibilityChange = () => {
      if (document.hidden && !result && !error) {
         // User switched tabs - FAIL THE TEST
         failTest("Test terminated: You switched tabs/windows.");
      }
    };

    // 4. Blur Listener (Clicking outside/Alt-Tab)
    const handleBlur = () => {
        if (!result && !error) {
             // Optional: can be too strict, maybe just use visibilityChange
             // failTest("Test terminated: Window lost focus.");
        }
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // window.addEventListener("blur", handleBlur); // Too strict for some browsers

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // window.removeEventListener("blur", handleBlur);
      
      // Exit full screen on cleanup
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Exit full screen error", err));
      }
    };
  }, [isOpen, result, error]);

  const failTest = (reason: string) => {
      // Immediately fail the test locally
      setResult({
          passed: false,
          score: 0,
          correctCount: 0,
          totalQuestions: testData?.questions.length || 0,
          message: reason
      });
      // Optionally notify backend of cheating attempt
  };

  const handleExit = () => {
      if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
      }
      onClose();
  };

  const handleRetry = () => {
    setResult(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
    loadTest(); 
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-full max-h-screen h-screen bg-white text-gray-900 border-none shadow-none rounded-none p-0 overflow-y-auto font-mont">
        {/* Header */}
        <div className="bg-[#8A63FF] px-6 py-4 text-white flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-full">
               <Lock className="w-6 h-6 text-white" />
             </div>
             <div>
                <DialogTitle className="text-xl font-bold">Entrance Test</DialogTitle>
                <DialogDescription className="text-white/80 text-xs">
                  {courseTitle}
                </DialogDescription>
             </div>
          </div>
          <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
            Full Screen Mode Enforced
          </div>
        </div>

        <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner className="w-12 h-12 text-[#8A63FF] mb-6" />
              <p className="text-gray-500 text-lg">Preparing your assessment...</p>
              <p className="text-sm text-gray-400 mt-2">Do not switch tabs or exit full screen.</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h3>
              <p className="text-red-500 mb-8">{error}</p>
              <Button onClick={onClose} variant="outline" className="px-8">Close</Button>
            </div>
          ) : result ? (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
              {result.passed ? (
                <>
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-green-600 mb-2">Congratulations!</h3>
                  <div className="mb-8">
                      <p className="text-gray-600 text-lg">You passed the entrance test!</p>
                      <p className="text-4xl font-bold text-[#8A63FF] mt-2">{result.score.toFixed(0)}%</p>
                      <p className="text-gray-500 text-sm mt-1">({result.correctCount} / {result.totalQuestions} Correct)</p>
                  </div>
                  <Button onClick={() => { onPass(); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all">
                    Proceed to Enrollment <ArrowRight className="ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-red-600 mb-2">Test Failed</h3>
                   <div className="mb-8">
                      <p className="text-gray-600 text-lg">
                        {result.message || `You need ${testData?.passingScore}% to pass.`}
                      </p>
                      <p className="text-4xl font-bold text-red-500 mt-2">{result.score.toFixed(0)}%</p>
                       <p className="text-gray-500 text-sm mt-1">({result.correctCount} / {result.totalQuestions} Correct)</p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button onClick={onClose} variant="outline" className="px-8 py-3">Exit</Button>
                    <Button onClick={handleRetry} className="bg-[#8A63FF] text-white hover:bg-[#7047e0] px-8 py-3 rounded-full">Try Again</Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Question Area */
            <div className="animate-in slide-in-from-bottom-5 duration-500">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Question {currentQuestionIndex + 1} / {testData?.questions.length}</span>
                <span className="text-sm font-semibold bg-green-50 text-green-700 px-3 py-1 rounded-full">Pass: {testData?.passingScore}%</span>
              </div>

              {testData?.questions[currentQuestionIndex] && (
                <div className="mb-10">
                  <h3 className="text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
                    {testData.questions[currentQuestionIndex].question}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {testData.questions[currentQuestionIndex].options.map((option, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 group ${
                          answers[testData.questions[currentQuestionIndex]._id] === option
                            ? "bg-purple-50 border-[#8A63FF] shadow-md"
                            : "bg-white border-gray-100 hover:border-[#8A63FF]/30 hover:shadow-md"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                           answers[testData.questions[currentQuestionIndex]._id] === option
                            ? "border-[#8A63FF] bg-[#8A63FF]"
                            : "border-gray-300 group-hover:border-[#8A63FF]"
                        }`}>
                          {answers[testData.questions[currentQuestionIndex]._id] === option && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </div>
                        <span className={`text-lg ${
                          answers[testData.questions[currentQuestionIndex]._id] === option ? "text-[#8A63FF] font-medium" : "text-gray-700"
                        }`}>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-between items-center w-full mt-10 pt-6 border-t border-gray-100">
                 <Button variant="ghost" onClick={handleExit} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                    Exit Test
                 </Button>
                 <Button 
                    onClick={handleNext} 
                    disabled={!answers[testData?.questions[currentQuestionIndex]?._id || ""]}
                    size="lg"
                    className="bg-[#8A63FF] hover:bg-[#7047e0] text-white px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {currentQuestionIndex === (testData?.questions.length || 0) - 1 ? (
                      submitting ? "Submitting..." : "Submit Test"
                    ) : (
                      <>Next Question <ArrowRight className="ml-2 w-5 h-5" /></>
                    )}
                  </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntranceTestModal;

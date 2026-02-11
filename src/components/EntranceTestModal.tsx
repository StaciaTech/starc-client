import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { assessmentService } from "@/services/assessmentService";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface EntranceTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onPass: () => void;
}

const EntranceTestModal: React.FC<EntranceTestModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onPass,
}) => {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      loadTest();
    }
  }, [isOpen, courseId]);

  const loadTest = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const data = await assessmentService.getEntranceTest(courseId);
      setTestData(data);
    } catch (error) {
      console.error("Failed to load test", error);
      toast.error("Failed to load entrance test. Please try again.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!testData) return;

    // Validate all questions answered
    if (Object.keys(answers).length < testData.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await assessmentService.submitEntranceTest(courseId, answers);
      setResult({ passed: res.passed, score: res.score });

      if (res.passed) {
        toast.success("Congratulations! You passed the entrance test.");
        // Delay close to show success message
        setTimeout(() => {
          onPass();
          onClose();
        }, 2000);
      } else {
        toast.error(
          `You scored ${res.score}%. You need ${testData.passingScore}% to pass.`,
        );
      }
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit test.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Entrance Test: {courseTitle}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : result ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            {result.passed ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-bold text-green-700">
                  Test Passed!
                </h2>
                <p>Your score: {result.score.toFixed(0)}%</p>
                <p className="text-gray-600">
                  You can now enroll in this course.
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-red-700">Test Failed</h2>
                <p>Your score: {result.score.toFixed(0)}%</p>
                <p className="text-red-400">
                  Required: {testData?.passingScore}%
                </p>
                <Button
                  onClick={loadTest}
                  className="mt-4 bg-purple-600 text-white"
                >
                  Retake Test
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Answer all {testData?.questions.length} questions to verify your
              eligibility. Passing score: {testData?.passingScore}%
            </p>

            <div className="space-y-6">
              {testData?.questions.map((q: any, index: number) => (
                <div key={q._id} className="border p-4 rounded-lg bg-gray-50">
                  <p className="font-medium mb-3">
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option: string) => (
                      <label
                        key={option}
                        className={`flex items-center space-x-2 p-3 rounded cursor-pointer border transition-all ${
                          answers[q._id] === option
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q._id}
                          value={option}
                          checked={answers[q._id] === option}
                          onChange={() => handleOptionSelect(q._id, option)}
                          className="text-purple-600"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Submit Test"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EntranceTestModal;

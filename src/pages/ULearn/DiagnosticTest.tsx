import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  getDiagnosticTest, generateCourse,
  type DiagnosticQuestion, type DiagnosticAnswer,
} from "@/services/ulearnService";

const DiagnosticTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const topic = (location.state as any)?.topic || "";

  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingTest, setLoadingTest] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    if (!topic) { navigate("/course"); return; }
    getDiagnosticTest(topic)
      .then((r) => setQuestions(r.questions))
      .catch(() => { toast.error("Could not load diagnostic test."); navigate("/course"); })
      .finally(() => setLoadingTest(false));
  }, [topic]);

  const handleAnswer = (qId: string, answer: string) =>
    setAnswers((p) => ({ ...p, [qId]: answer }));

  const handleNext = () => {
    if (!answers[questions[currentQ].id]) { toast.error("Please answer this question."); return; }
    setCurrentQ((p) => p + 1);
  };

  const handleSubmit = async () => {
    if (!questions.every((q) => answers[q.id])) { toast.error("Please answer all questions."); return; }
    setSubmitting(true);
    try {
      const diagnosticAnswers: DiagnosticAnswer[] = questions.map((q) => ({
        question: q.question,
        answer: answers[q.id] || "",
      }));
      const result = await generateCourse({ topic, diagnosticAnswers, skillLevel: "mixed" });
      navigate(`/learn/generating/${result.courseId}`, { state: { topic } });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate course.");
      setSubmitting(false);
    }
  };

  if (loadingTest) {
    return (
      <div className="min-h-screen bg-gray-100 font-mont">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8A63FF]" />
          <p className="text-gray-500">Preparing your personalised test for <strong>{topic}</strong>…</p>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const isLast = currentQ === questions.length - 1;
  const progress = (currentQ / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[#8A63FF] text-sm font-semibold mb-3">
            Diagnostic Test · {topic}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#8A63FF] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-gray-400 text-xs">Question {currentQ + 1} of {questions.length}</span>
            <span className="text-gray-400 text-xs">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[20px] shadow-md p-8">
          <div className="flex items-start gap-3 mb-6">
            <span className="text-[#8A63FF] font-black text-2xl shrink-0">Q{currentQ + 1}</span>
            <h2 className="text-gray-900 text-lg font-semibold leading-snug">{q.question}</h2>
          </div>

          {q.type === "mcq" ? (
            <div className="space-y-3">
              {q.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(q.id, opt)}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${
                    answers[q.id] === opt
                      ? "bg-[#8A63FF]/10 border-[#8A63FF] text-[#8A63FF] font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-[#8A63FF]/50 hover:bg-purple-50"
                  }`}
                >
                  <span className="font-bold text-[#8A63FF] mr-3">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              rows={4}
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              placeholder="Type your answer here…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A63FF]/50 focus:border-[#8A63FF] resize-none"
            />
          )}

          <div className="flex items-center justify-between mt-8">
            {currentQ > 0 ? (
              <button onClick={() => setCurrentQ((p) => p - 1)} className="text-gray-400 hover:text-gray-700 text-sm transition-colors">
                ← Previous
              </button>
            ) : <div />}

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Building your course…</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit & Generate</>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-xs text-center mt-4">
          Honest answers help us personalise your course better.
        </p>
      </div>
    </div>
  );
};

export default DiagnosticTest;

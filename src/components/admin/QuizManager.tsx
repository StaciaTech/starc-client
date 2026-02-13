import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import quizService, {
  IQuiz,
  IQuizQuestion,
  IQuizOption,
} from "@/services/quizService";
import { CourseStructure } from "@/services/courseStructureService";

interface QuizManagerProps {
  courseId: string;
  courseStructure: CourseStructure | null;
  onUpdate: () => void;
}

const QuizManager: React.FC<QuizManagerProps> = ({
  courseId,
  courseStructure,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Partial<IQuiz> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeSubchapterId, setActiveSubchapterId] = useState<string | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  // Form State
  const [currentQuestion, setCurrentQuestion] = useState<
    Partial<IQuizQuestion>
  >({
    questionText: "",
    options: [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
    points: 10,
    explanation: "",
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  const resetForm = () => {
    setEditingQuiz({
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 70,
      questions: [],
      isPublished: true,
    });
    setCurrentQuestion({
      questionText: "",
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      points: 10,
      explanation: "",
    });
    setEditingQuestionIndex(null);
  };

  const handleCreateQuiz = (subchapterId: string, defaultTitle: string) => {
    setActiveSubchapterId(subchapterId);
    resetForm();
    setEditingQuiz((prev) => ({
      ...prev,
      title: `${defaultTitle} Quiz`,
      questions: [],
    }));
    setIsDialogOpen(true);
  };

  const handleEditQuiz = async (quizId: string, subchapterId: string) => {
    try {
      setLoading(true);
      setActiveSubchapterId(subchapterId);
      console.log(
        `[QuizManager] Fetching quiz for subchapter: ${subchapterId}`,
      );

      // Use Admin API to get full quiz details by subchapter (no randomization)
      const quiz = await quizService.getAdminQuizBySubchapter(subchapterId);
      console.log("[QuizManager] Fetched Quiz:", quiz);

      const quizData: any = { ...quiz };

      // Normalize Questions: Map backend format to UI format
      // Priority: questions (Standard) > questionPool (Legacy/Mistake)
      const sourceQuestions =
        quizData.questions && quizData.questions.length > 0
          ? quizData.questions
          : quizData.questionPool || [];

      quizData.questions = sourceQuestions.map((q: any) => ({
        _id: q._id,
        questionText: q.question || q.questionText || "",
        options: Array.isArray(q.options)
          ? q.options.map((opt: any, idx: number) => {
              // Handle if options are strings or objects
              const text = typeof opt === "string" ? opt : opt.optionText;
              return {
                optionText: text,
                isCorrect: q.correctAnswer === idx,
              };
            })
          : [
              { optionText: "", isCorrect: false },
              { optionText: "", isCorrect: false },
            ],
        points: q.points || 1,
        explanation: q.explanation || "",
      }));

      setEditingQuiz(quizData);
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error("[QuizManager] Failed to load quiz details:", error);
      if (error.response) {
        console.error(
          "[QuizManager] Error Response:",
          error.response.status,
          error.response.data,
        );
      }
      toast.error("Failed to load quiz details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      setLoading(true);
      await quizService.deleteQuiz(quizToDelete);
      toast.success("Quiz deleted successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete quiz");
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setQuizToDelete(null);
    }
  };

  const handleSaveQuiz = async () => {
    if (!editingQuiz || !editingQuiz.title) {
      toast.error("Quiz title is required");
      return;
    }

    if (!editingQuiz.questions || editingQuiz.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    try {
      setLoading(true);

      // Transform UI questions to Backend `questionPool` format
      const questionPool = (editingQuiz.questions || []).map((q: any) => ({
        // Map UI questions to Backend schema format
        // Schema expects: { question: String, options: [String], correctAnswer: Number, explanation: String }
        _id: q._id, // Preserve ID to maintain references in UserQuiz attempts
        question: q.questionText,
        options: q.options?.map((o: any) => o.optionText) || [],
        correctAnswer: q.options?.findIndex((o: any) => o.isCorrect) ?? 0,
        explanation: q.explanation || "",
        difficulty: "medium",
        points: q.points || 1,
      }));

      const quizData = {
        ...editingQuiz,
        subchapterId: activeSubchapterId,
        courseId: courseId,
        questionPool: questionPool, // Use `questionPool` which matches the schema we are mapping to
        // questions: [] // REMOVED: Backend hook will now sync this from questionPool
      };

      if (editingQuiz._id) {
        await quizService.updateQuiz(editingQuiz._id, quizData as any);
        toast.success("Quiz updated successfully");
      } else {
        await quizService.createQuiz(courseId, quizData as any);
        toast.success("Quiz created successfully");
      }
      setIsDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  // --- Question Manipulation ---

  const handleAddOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), { optionText: "", isCorrect: false }],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (
    index: number,
    field: "optionText" | "isCorrect",
    value: any,
  ) => {
    setCurrentQuestion((prev) => {
      const newOptions = [...(prev.options || [])];
      if (field === "isCorrect") {
        // Only one correct answer allowed for now (or multi-select if backend supports)
        // Assuming single choice for simplicity based on IQuizQuestion structure
        // Actually interface allows multiple boolean flags, but typically one is correct.
        // Let's enforce single choice UI but allow data structure.
        newOptions.forEach((opt, i) => (opt.isCorrect = i === index));
      } else {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }
      return { ...prev, options: newOptions };
    });
  };

  const handleSaveQuestion = () => {
    if (
      !currentQuestion.questionText ||
      !currentQuestion.options ||
      currentQuestion.options.length < 2
    ) {
      toast.error("Question text and at least 2 options are required");
      return;
    }

    if (!currentQuestion.options.some((opt) => opt.isCorrect)) {
      toast.error("Please mark at least one correct answer");
      return;
    }

    setEditingQuiz((prev: any) => {
      const newQuestions = [...(prev.questions || [])];
      if (editingQuestionIndex !== null) {
        newQuestions[editingQuestionIndex] = currentQuestion;
      } else {
        newQuestions.push(currentQuestion);
      }
      return { ...prev, questions: newQuestions };
    });

    // Reset question form
    setCurrentQuestion({
      questionText: "",
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      points: 10,
      explanation: "",
    });
    setEditingQuestionIndex(null);
  };

  const handleEditQuestion = (index: number) => {
    if (!editingQuiz?.questions) return;
    setCurrentQuestion(editingQuiz.questions[index]);
    setEditingQuestionIndex(index);
  };

  const handleDeleteQuestion = (index: number) => {
    setEditingQuiz((prev: any) => ({
      ...prev,
      questions: prev.questions?.filter((_: any, i: number) => i !== index),
    }));
  };

  if (
    !courseStructure ||
    !courseStructure.chapters ||
    courseStructure.chapters.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">
          No structure defined
        </h3>
        <p className="text-gray-500 mb-4">
          Create chapters and subchapters to add quizzes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Banner */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3">
        <div className="bg-amber-100 p-2 rounded-full text-amber-600 h-fit">
          <HelpCircle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-medium text-amber-900">Quiz Management</h4>
          <p className="text-sm text-amber-700 mt-1">
            Create and manage quizzes for each subchapter. Quizzes are unlocked
            sequentially for students.
          </p>
        </div>
      </div>

      {/* Structure List */}
      <div className="space-y-6">
        {courseStructure.chapters.map((chapter, chapterIndex) => (
          <div
            key={chapter.id || chapter._id || chapterIndex}
            className="relative pl-8 border-l-2 border-gray-200 ml-4"
          >
            <div className="absolute -left-[1.3rem] top-0 bg-[#8A63FF] text-white h-10 w-10 rounded-full flex items-center justify-center font-bold shadow-md z-10 ring-4 ring-white">
              {chapterIndex + 1}
            </div>

            <div className="mb-4 pt-1">
              <h3 className="text-lg font-bold text-gray-900">
                {chapter.title}
              </h3>
            </div>

            <div className="grid gap-3">
              {chapter.subchapters?.map((sub: any, subIndex: number) => (
                <Card
                  key={sub.id || sub._id}
                  className="border-l-4 border-l-gray-200 hover:border-l-[#8A63FF] transition-all"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          {chapterIndex + 1}.{subIndex + 1}
                        </Badge>
                        <h4 className="font-medium text-gray-900">
                          {sub.title}
                        </h4>
                      </div>
                      {sub.quiz ? (
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>
                              Quiz Active ({sub.quiz.questions?.length || 0}{" "}
                              Questions)
                            </span>
                          </div>

                          {/* Inline Question Display */}
                          {(sub.quiz.questions?.length > 0 ||
                            sub.quiz.questionPool?.length > 0) && (
                            <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-sm">
                              {(sub.quiz.questions?.length > 0
                                ? sub.quiz.questions
                                : sub.quiz.questionPool
                              ).map((q: any, qIdx: number) => (
                                <div
                                  key={q.id || q._id || qIdx}
                                  className="mb-4 last:mb-0"
                                >
                                  <p className="font-semibold text-gray-800 mb-1">
                                    {qIdx + 1}. {q.question || q.questionText}
                                  </p>
                                  <ul className="space-y-1 pl-4">
                                    {q.options?.map(
                                      (opt: string, oIdx: number) => (
                                        <li
                                          key={oIdx}
                                          className={`flex items-start gap-2 ${oIdx === q.correctAnswer ? "text-green-700 font-medium" : "text-gray-600"}`}
                                        >
                                          <div
                                            className={`mt-1 h-3 w-3 rounded-full border flex items-center justify-center ${oIdx === q.correctAnswer ? "border-green-600 bg-green-100" : "border-gray-300"}`}
                                          >
                                            {oIdx === q.correctAnswer && (
                                              <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                                            )}
                                          </div>
                                          <span>{opt}</span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span>No Quiz Assigned</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.quiz ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEditQuiz(
                                sub.quiz._id || sub.quiz,
                                sub.id || sub._id,
                              )
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit Quiz
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteQuiz(sub.quiz._id || sub.quiz)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEditQuiz("new", sub.id || sub._id)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit Quiz
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#8A63FF] hover:bg-[#7c58e6]"
                            onClick={() =>
                              handleCreateQuiz(sub.id || sub._id, sub.title)
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" /> Create Quiz
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuiz?._id ? "Edit Quiz" : "Create New Quiz"}
            </DialogTitle>
            <DialogDescription>
              Configure quiz settings and manage questions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
              <div className="space-y-2">
                <Label>Quiz Title</Label>
                <Input
                  value={editingQuiz?.title || ""}
                  onChange={(e) =>
                    setEditingQuiz((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label>Time Limit (Minutes)</Label>
                <Input
                  type="number"
                  value={editingQuiz?.timeLimit || 30}
                  onChange={(e) =>
                    setEditingQuiz((prev) => ({
                      ...prev,
                      timeLimit: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input
                  type="number"
                  value={editingQuiz?.passingScore || 70}
                  onChange={(e) =>
                    setEditingQuiz((prev) => ({
                      ...prev,
                      passingScore: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  checked={editingQuiz?.isPublished || false}
                  onCheckedChange={(checked) =>
                    setEditingQuiz((prev) => ({
                      ...prev,
                      isPublished: checked,
                    }))
                  }
                />
                <Label>Publish Quiz</Label>
              </div>
            </div>

            {/* Question Editor */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Questions</h3>
                <Badge variant="outline">
                  {editingQuiz?.questions?.length || 0} Questions Total
                </Badge>
              </div>

              {/* Add New Question Form - Only show when NOT editing an existing one */}
              {editingQuestionIndex === null && (
                <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                  <h4 className="font-medium text-sm text-gray-700">
                    Add New Question
                  </h4>
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={currentQuestion.questionText || ""}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          questionText: e.target.value,
                        }))
                      }
                      placeholder="Enter question..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options</Label>
                    {currentQuestion.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() =>
                            handleOptionChange(idx, "isCorrect", true)
                          }
                          className="w-4 h-4 text-[#8A63FF]"
                        />
                        <Input
                          value={opt.optionText}
                          onChange={(e) =>
                            handleOptionChange(
                              idx,
                              "optionText",
                              e.target.value,
                            )
                          }
                          placeholder={`Option ${idx + 1}`}
                          className={opt.isCorrect ? "border-green-500" : ""}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(idx)}
                          disabled={(currentQuestion.options?.length || 0) <= 2}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="mt-2"
                    >
                      <Plus className="h-3 w-3 mr-2" /> Add Option
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button onClick={handleSaveQuestion}>Add Question</Button>
                  </div>
                </div>
              )}

              {/* Questions List with Inline Editing */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {editingQuiz?.questions?.map((q: any, idx: number) => (
                  <div key={idx}>
                    {editingQuestionIndex === idx ? (
                      // Inline Editor
                      <div className="bg-white border-2 border-[#8A63FF] p-4 rounded-lg space-y-4 shadow-md my-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm text-[#8A63FF]">
                            Editing Question #{idx + 1}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingQuestionIndex(null);
                              // Reset current question if desired or keep it?
                              // Current logic reset it fully. Let's replicate logic for consistency
                              setCurrentQuestion({
                                questionText: "",
                                options: [
                                  { optionText: "", isCorrect: false },
                                  { optionText: "", isCorrect: false },
                                ],
                                points: 10,
                                explanation: "",
                              });
                            }}
                          >
                            <XCircle className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Question Text</Label>
                          <Textarea
                            value={currentQuestion.questionText || ""}
                            onChange={(e) =>
                              setCurrentQuestion((prev) => ({
                                ...prev,
                                questionText: e.target.value,
                              }))
                            }
                            placeholder="Enter question..."
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Options</Label>
                          {currentQuestion.options?.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="radio"
                                name={`correctOption-${idx}`}
                                checked={opt.isCorrect}
                                onChange={() =>
                                  handleOptionChange(optIdx, "isCorrect", true)
                                }
                                className="w-4 h-4 text-[#8A63FF]"
                              />
                              <Input
                                value={opt.optionText}
                                onChange={(e) =>
                                  handleOptionChange(
                                    optIdx,
                                    "optionText",
                                    e.target.value,
                                  )
                                }
                                placeholder={`Option ${optIdx + 1}`}
                                className={
                                  opt.isCorrect ? "border-green-500" : ""
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveOption(optIdx)}
                                disabled={
                                  (currentQuestion.options?.length || 0) <= 2
                                }
                              >
                                <Trash2 className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddOption}
                            className="mt-2"
                          >
                            <Plus className="h-3 w-3 mr-2" /> Add Option
                          </Button>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingQuestionIndex(null);
                              setCurrentQuestion({
                                questionText: "",
                                options: [
                                  { optionText: "", isCorrect: false },
                                  { optionText: "", isCorrect: false },
                                ],
                                points: 10,
                                explanation: "",
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveQuestion}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Edit
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Summary View
                      <div className="p-4 bg-white border rounded shadow-sm hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="font-bold text-gray-500 whitespace-nowrap mt-1">
                            {idx + 1}.
                          </span>
                          <p className="font-medium text-gray-900 break-words leading-relaxed whitespace-pre-wrap flex-1">
                            {q.questionText}
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(idx)}
                            className="text-gray-600 hover:text-[#8A63FF] hover:bg-purple-50"
                          >
                            <Edit className="h-4 w-4 mr-1.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuiz} disabled={loading}>
              {loading && <Spinner className="mr-2 h-4 w-4" />}
              Save Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quiz? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading && <Spinner className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizManager;

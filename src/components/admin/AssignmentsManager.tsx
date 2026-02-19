import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Calendar,
  Edit,
  FileText,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Users,
} from "lucide-react";
import { Clock, MoreVertical, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Assignment,
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  reorderAssignments,
  getAllSubmissions,
  AssignmentSubmission,
  provideSubmissionFeedback,
} from "@/services/assignmentService";

interface AssignmentsManagerProps {
  courseId: string;
  courseStructure?: any; // To get chapters
}

const AssignmentsManager: React.FC<AssignmentsManagerProps> = ({
  courseId,
  courseStructure
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState<string>("");
  
  // New input states
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");

  // Operation states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const data = await getAllAssignments(courseId);
        setAssignments(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Failed to load assignments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  const handleCreateClick = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleEditClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setTitle(assignment.title || "");
    setDescription(assignment.description || "");
    setInstructions(assignment.instructions || "");
    
    // Set new fields
    setSelectedChapterId(assignment.chapterId || "");
    setTasks(assignment.tasks || []);
    setDifficulty(assignment.difficulty || "Medium");
    setEstimatedDuration(assignment.estimatedDuration || "");

    setDeadline(formatDateForInput(assignment.deadline));
    setIsPublished(assignment.isPublished);
    setFormError(null);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };

  const handleViewSubmissionsClick = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);

    try {
      const submissionsData = await getAllSubmissions(assignment._id);
      setSubmissions(submissionsData);
      setSubmissionsDialogOpen(true);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions. Please try again later.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleFeedbackClick = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || "");
    setGrade(submission.grade?.toString() || "");
    setFeedbackDialogOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setInstructions("");
    setDeadline("");
    setIsPublished(false);
    setSelectedChapterId("");
    setTasks([]);
    setDifficulty("Medium");
    setEstimatedDuration("");
    setFormError(null);
  };

  const validateForm = () => {
    // Validate title and description
    if (!title.trim()) {
      setFormError("Title is required");
      return false;
    }
    if (!description.trim()) {
      setFormError("Description is required");
      return false;
    }

    // Deadline validation only if provided
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        setFormError("Please enter a valid deadline date");
        return false;
      }
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormError(null);

      const newAssignment = await createAssignment(courseId, {
        title,
        description,
        instructions,
        deadline,
        chapterId: selectedChapterId,
        tasks,
        difficulty,
        estimatedDuration
      });

      setAssignments([...assignments, newAssignment]);
      setCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Error creating assignment:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to create assignment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAssignment || !validateForm()) return;

    try {
      setSubmitting(true);
      setFormError(null);

      const updatedAssignment = await updateAssignment(selectedAssignment._id, {
        title,
        description,
        instructions,
        deadline,
        isPublished,
        chapterId: selectedChapterId,
        tasks,
        difficulty,
        estimatedDuration
      });

      setAssignments(
        assignments.map((a) =>
          a._id === updatedAssignment._id ? updatedAssignment : a,
        ),
      );

      setEditDialogOpen(false);
    } catch (err: any) {
      console.error("Error updating assignment:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to update assignment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAssignment) return;

    try {
      setSubmitting(true);

      await deleteAssignment(selectedAssignment._id);

      setAssignments(
        assignments.filter((a) => a._id !== selectedAssignment._id),
      );

      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Error deleting assignment:", err);
      setError("Failed to delete assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission) return;

    // Validate grade if provided
    if (
      grade &&
      (isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 10)
    ) {
      setFormError("Grade must be a number between 0 and 10");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const updatedSubmission = await provideSubmissionFeedback(
        selectedSubmission._id,
        feedback,
        grade ? Number(grade) : undefined,
      );

      // Update the submission in the list
      setSubmissions(
        submissions.map((s) =>
          s._id === updatedSubmission._id ? updatedSubmission : s,
        ),
      );

      setFeedbackDialogOpen(false);
    } catch (err: any) {
      console.error("Error providing feedback:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to submit feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChapterMoveUp = async (assignmentId: string, chapterId: string) => {
    const chapterAssignments = assignmentsByChapter.grouped[chapterId] || [];
    const index = chapterAssignments.findIndex((a) => a._id === assignmentId);
    if (index <= 0) return;

    const currentAssignment = chapterAssignments[index];
    const prevAssignment = chapterAssignments[index - 1];

    // Find indices in the main assignments array
    const currentIndex = assignments.findIndex((a) => a._id === currentAssignment._id);
    const prevIndex = assignments.findIndex((a) => a._id === prevAssignment._id);

    if (currentIndex === -1 || prevIndex === -1) return;

    // Create a new array and swap the elements
    const reorderedAssignments = [...assignments];
    // Swap positions in the main array to reflect the new order
    // But since the main array might be mixed, we essentially want to swap their 'order' values effectively
    // by swapping their positions in the array if the array drives the order.
    // However, if we just swap them in the array, their relative order changes.
    
    // Actually, to support reordering, we should rely on the array order.
    // So swapping them in the array is correct.
    reorderedAssignments[currentIndex] = prevAssignment;
    reorderedAssignments[prevIndex] = currentAssignment;

    // Update local state
    setAssignments(reorderedAssignments);

    // Send reorder request
    try {
        // We need to send the list of IDs in the NEW order.
        // If the backend assigns order based on index, we must ensure the entire list is correct.
        const assignmentIds = reorderedAssignments.map((a) => a._id);
        await reorderAssignments(courseId, assignmentIds);
    } catch (err) {
        console.error("Error reordering assignments:", err);
        setError("Failed to reorder assignments. Please try again.");
        const data = await getAllAssignments(courseId);
        setAssignments(data);
    }
  };

  const handleChapterMoveDown = async (assignmentId: string, chapterId: string) => {
    const chapterAssignments = assignmentsByChapter.grouped[chapterId] || [];
    const index = chapterAssignments.findIndex((a) => a._id === assignmentId);
    if (index === -1 || index >= chapterAssignments.length - 1) return;

    const currentAssignment = chapterAssignments[index];
    const nextAssignment = chapterAssignments[index + 1];

    // Find indices in the main assignments array
    const currentIndex = assignments.findIndex((a) => a._id === currentAssignment._id);
    const nextIndex = assignments.findIndex((a) => a._id === nextAssignment._id);

    if (currentIndex === -1 || nextIndex === -1) return;

    // Swap
    const reorderedAssignments = [...assignments];
    reorderedAssignments[currentIndex] = nextAssignment;
    reorderedAssignments[nextIndex] = currentAssignment;

    setAssignments(reorderedAssignments);

    try {
        const assignmentIds = reorderedAssignments.map((a) => a._id);
        await reorderAssignments(courseId, assignmentIds);
    } catch (err) {
        console.error("Error reordering assignments:", err);
        setError("Failed to reorder assignments. Please try again.");
        const data = await getAllAssignments(courseId);
        setAssignments(data);
    }
  };

  // State for assignment grouping
  const [activeAccordion, setActiveAccordion] = useState<string[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  // Initialize chapters from course structure
  useEffect(() => {
    if (courseStructure?.chapters) {
      setChapters(courseStructure.chapters);
      // Open all chapters by default
      setActiveAccordion(courseStructure.chapters.map((c: any) => c.id || c._id));
    }
  }, [courseStructure]);

  // Group assignments by chapter
  const assignmentsByChapter = React.useMemo(() => {
    const grouped: { [key: string]: Assignment[] } = {};
    const uncategorized: Assignment[] = [];

    assignments.forEach((assignment) => {
      // Create a normalized key
      const key = assignment.chapterId || (assignment as any).chapter;
      
      if (key) {
        // Ensure key is a string
        const keyStr = typeof key === 'object' ? key.toString() : key;
        
        if (!grouped[keyStr]) {
          grouped[keyStr] = [];
        }
        grouped[keyStr].push(assignment);
      } else {
        uncategorized.push(assignment);
      }
    });

    return { grouped, uncategorized };
  }, [assignments]);

  const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const formatDateForInput = (dateString: string | Date | undefined | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (e) {
      return "";
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage assignments for each chapter of the course.
          </p>
        </div>
        <Button onClick={handleCreateClick} className="bg-[#8A63FF] hover:bg-[#7A53EF]">
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
           <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Assignments Yet</h3>
          <p className="text-gray-500 mb-4 text-center max-w-md">
            Create assignments to test student knowledge. Assignments can be linked to specific chapters.
          </p>
          <Button onClick={handleCreateClick} variant="outline">
            Create First Assignment
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Render Chapters with Assignments */}
          {chapters.map((chapter, index) => {
            const chapterId = chapter.id || chapter._id;
            const chapterAssignments = assignmentsByChapter.grouped[chapterId] || [];
            const isExpanded = activeAccordion.includes(chapterId);

            return (
              <div key={chapterId} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setActiveAccordion(prev => 
                      prev.includes(chapterId) 
                        ? prev.filter(id => id !== chapterId)
                        : [...prev, chapterId]
                    );
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 shadow-sm">
                      {index + 1}
                    </div>
                    <div>
                         <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                         <p className="text-xs text-gray-500">{chapterAssignments.length} Assignments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-100">
                    {chapterAssignments.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-lg">
                        No assignments for this chapter.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {chapterAssignments.map((assignment, idx) => (
                          <AssignmentCard 
                            key={assignment._id} 
                            assignment={assignment} 
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onViewSubmissions={handleViewSubmissionsClick}
                            onMoveUp={() => handleChapterMoveUp(assignment._id, chapterId)}
                            onMoveDown={() => handleChapterMoveDown(assignment._id, chapterId)}
                            showOrderControls={true}
                            isFirst={idx === 0}
                            isLast={idx === chapterAssignments.length - 1}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized Assignments */}
          {assignmentsByChapter.uncategorized.length > 0 && (
             <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                   <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                     <AlertCircle className="h-4 w-4 text-orange-500" />
                     Uncategorized Assignments
                   </h3>
                </div>
                <div className="p-4 grid grid-cols-1 gap-4">
                   {assignmentsByChapter.uncategorized.map((assignment) => (
                      <AssignmentCard 
                        key={assignment._id} 
                        assignment={assignment} 
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onViewSubmissions={handleViewSubmissionsClick}
                        showOrderControls={false}
                      />
                   ))}
                </div>
             </div>
          )}
        </div>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Add a new assignment to a specific chapter.
            </DialogDescription>
          </DialogHeader>

          <AssignmentForm 
             chapters={chapters} 
             formData={{ title, description, instructions, deadline, chapterId: selectedChapterId, estimatedDuration, difficulty, tasks }}
             setFormData={{ setTitle, setDescription, setInstructions, setDeadline, setChapterId: setSelectedChapterId, setEstimatedDuration, setDifficulty, setTasks }}
             onSubmit={handleCreate}
             isSubmitting={submitting}
             onCancel={() => setCreateDialogOpen(false)}
             error={formError}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update assignment details.
            </DialogDescription>
          </DialogHeader>

           <AssignmentForm 
             chapters={chapters} 
             formData={{ title, description, instructions, deadline, chapterId: selectedChapterId, estimatedDuration, difficulty, tasks, isPublished }}
             setFormData={{ setTitle, setDescription, setInstructions, setDeadline, setChapterId: setSelectedChapterId, setEstimatedDuration, setDifficulty, setTasks, setIsPublished }}
             onSubmit={handleUpdate}
             isSubmitting={submitting}
             onCancel={() => setEditDialogOpen(false)}
             error={formError}
             isEdit
          />
        </DialogContent>
      </Dialog>

      {/* Delete/Submissions/Feedback Dialogs remain similar, simplified here for brevity but logic is preserved */}
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action
              cannot be undone. All student submissions for this assignment will
              also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog
        open={submissionsDialogOpen}
        onOpenChange={setSubmissionsDialogOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title} - Submissions</DialogTitle>
            <DialogDescription>
              View all student submissions for this assignment.
            </DialogDescription>
          </DialogHeader>

          {loadingSubmissions ? (
            <div className="flex flex-col items-center justify-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
               <p className="text-gray-500">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No submissions for this assignment yet.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Student</th>
                    <th className="text-left p-3 font-medium text-gray-600">Submission</th>
                    <th className="text-left p-3 font-medium text-gray-600">Date</th>
                    <th className="text-left p-3 font-medium text-gray-600">Grade</th>
                    <th className="text-right p-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="border-b hover:bg-gray-50/50">
                      <td className="p-3">
                        {typeof submission.userId === "object" &&
                        submission.userId !== null ? (
                          <>
                            <div className="font-medium text-gray-900">{(submission.userId as any).name}</div>
                            <div className="text-xs text-gray-500">
                              {(submission.userId as any).email}
                            </div>
                          </>
                        ) : (
                          "Unknown User"
                        )}
                      </td>
                      <td className="p-3">
                        <a
                          href={submission.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <FileText className="h-3 w-3 mr-1" /> View Submission
                        </a>
                      </td>
                      <td className="p-3 text-gray-600">
                        {format(
                          new Date(submission.submissionDate),
                          "MMM d, yyyy h:mm a",
                        )}
                      </td>
                      <td className="p-3">
                        {submission.grade !== undefined ? (
                           <Badge variant={submission.grade >= 7 ? "default" : "secondary"}>
                             {submission.grade}/10
                           </Badge>
                        ) : (
                           <span className="text-gray-400 italic">Not graded</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedbackClick(submission)}
                        >
                          Feedback
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSubmissionsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Add feedback and grade for this submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
             <div className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Submission Link:</span>
                <a
                  href={selectedSubmission?.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate max-w-[300px]"
                >
                  {selectedSubmission?.submissionUrl}
                </a>
             </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade (0-10)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="10"
                placeholder="Grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <div className="bg-white border rounded-md overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={feedback}
                  onChange={setFeedback}
                  modules={{
                    toolbar: [
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                    ],
                  }}
                  className="h-40 mb-12" 
                />
              </div>
            </div>

            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sub-components for cleaner code
const AssignmentCard = ({ assignment, onEdit, onDelete, onViewSubmissions, onMoveUp, onMoveDown, showOrderControls = true, isFirst, isLast }: any) => {
   return (
     <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
        <div className="flex justify-between items-start gap-4">
           {showOrderControls && (
              <div className="flex flex-col gap-1 mt-1">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }} 
                    disabled={isFirst}
                    title="Move Up"
                 >
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                 </Button>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }} 
                    disabled={isLast}
                    title="Move Down"
                 >
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                 </Button>
              </div>
           )}

           <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                 <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                 <Badge variant={assignment.isPublished ? "default" : "secondary"} className="text-xs">
                    {assignment.isPublished ? "Published" : "Draft"}
                 </Badge>
                 {assignment.difficulty && (
                    <Badge variant="outline" className={`text-xs ${
                        assignment.difficulty === 'Easy' ? 'text-green-600 bg-green-50 border-green-200' :
                        assignment.difficulty === 'Medium' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                        'text-red-600 bg-red-50 border-red-200'
                    }`}>
                        {assignment.difficulty}
                    </Badge>
                 )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{assignment.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-400">
                 <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due: {assignment.deadline ? format(new Date(assignment.deadline), "MMM d, yyyy") : "No Date"}</span>
                 </div>
                 {assignment.estimatedDuration && (
                    <div className="flex items-center gap-1">
                       <Clock className="h-3 w-3" />
                       <span>{assignment.estimatedDuration}</span>
                    </div>
                 )}
              </div>
           </div>

           <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewSubmissions(assignment)} title="Submissions">
                    <Users className="h-4 w-4 text-blue-600" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(assignment)} title="Edit">
                    <Edit className="h-4 w-4 text-gray-500" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(assignment)} title="Delete">
                     <Trash2 className="h-4 w-4 text-red-500" />
                 </Button>
              </div>
           </div>
        </div>
     </div>
   );
}

const AssignmentForm = ({ chapters, formData, setFormData, onSubmit, isSubmitting, onCancel, error, isEdit }: any) => {
   const { title, description, instructions, deadline, chapterId, estimatedDuration, difficulty, tasks, isPublished } = formData;
   const { setTitle, setDescription, setInstructions, setDeadline, setChapterId, setEstimatedDuration, setDifficulty, setTasks, setIsPublished } = setFormData;

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
               <Input id="title" placeholder="Assignment Title" value={title} onChange={(e) => setTitle(e.target.value)} />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="chapter">Chapter</Label>
               <Select value={chapterId} onValueChange={setChapterId}>
                  <SelectTrigger id="chapter">
                    <SelectValue placeholder="Select a Chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((c: any) => (
                       <SelectItem key={c.id || c._id} value={c.id || c._id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <Label htmlFor="deadline">Deadline</Label>
               <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
             </div>

             <div className="space-y-2">
                 <Label htmlFor="difficulty">Difficulty</Label>
                 <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                       <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="Easy">Easy</SelectItem>
                       <SelectItem value="Medium">Medium</SelectItem>
                       <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                 </Select>
             </div>

             <div className="space-y-2">
                <Label htmlFor="duration">Est. Duration</Label>
                <Input id="duration" placeholder="e.g. 2h 30m" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} />
             </div>
         </div>

         <div className="space-y-2">
            <Label htmlFor="description">Short Description <span className="text-red-500">*</span></Label>
            <Textarea id="description" placeholder="Brief overview..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
         </div>

         <div className="space-y-2">
            <Label>Tasks / Objectives</Label>
            <div className="space-y-2">
               {tasks && tasks.map((task: string, idx: number) => (
                  <div key={idx} className="flex gap-2">
                     <Input value={task} onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[idx] = e.target.value;
                        setTasks(newTasks);
                     }} />
                     <Button variant="ghost" size="icon" onClick={() => {
                        const newTasks = tasks.filter((_: any, i: number) => i !== idx);
                        setTasks(newTasks);
                     }}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                     </Button>
                  </div>
               ))}
               <Button type="button" variant="outline" size="sm" onClick={() => setTasks([...(tasks || []), ""])}>
                  <Plus className="h-3 w-3 mr-2" /> Add Task
               </Button>
            </div>
         </div>

         {isEdit && (
            <div className="flex items-center space-x-2 pt-4">
              <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="published">Published</Label>
            </div>
         )}
 
         {error && (
            <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertDescription>{error}</AlertDescription>
            </Alert>
         )}
 
         <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={onSubmit} disabled={isSubmitting}>
               {isSubmitting ? "Saving..." : isEdit ? "Update Assignment" : "Create Assignment"}
            </Button>
         </DialogFooter>
      </div>
   );
}

export default AssignmentsManager;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Search,
  User,
  Check,
  X,
} from "lucide-react";
import adminService from "@/services/adminService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Submission {
  id: string;
  userId: string; // Required for grading
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  chapterTitle: string;
  submissionLink: string;
  submittedAt: string;
  status: string;
  grade?: number;
  feedback?: string;
}

const CourseSubmissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Grading State
  const [gradingOpen, setGradingOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchSubmissions(courseId);
    }
  }, [courseId]);

  const fetchSubmissions = async (id: string) => {
    try {
      const response = await adminService.getCourseSubmissions(id);
      if (response.success) {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade?.toString() || "");
    setFeedback(submission.feedback || "");
    setGradingOpen(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission || !courseId) return;

    if (
      !grade ||
      isNaN(Number(grade)) ||
      Number(grade) < 0 ||
      Number(grade) > 10
    ) {
      toast.error("Please enter a valid grade between 0 and 10");
      return;
    }

    setSubmittingGrade(true);
    try {
      // Assuming submission.id is the assignment subdocument ID which we need
      await adminService.gradeAssignment({
        courseId,
        assignmentId: selectedSubmission.id,
        userId: selectedSubmission.userId, // Pass userId
        grade: Number(grade),
        feedback,
      });

      toast.success("Assignment graded successfully");
      setGradingOpen(false);
      fetchSubmissions(courseId); // Refresh list
    } catch (error) {
      console.error("Error grading assignment:", error);
      toast.error("Failed to save grade");
    } finally {
      setSubmittingGrade(false);
    }
  };

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Spinner className="h-12 w-12 text-[#8A63FF]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/assignments")}
            className="mb-4 pl-0 hover:bg-transparent hover:text-[#8A63FF]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Student Submissions
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage submissions for this course.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students or assignments..."
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-[#8A63FF]">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {submission.studentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {submission.studentEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-800">
                          {submission.assignmentTitle}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {submission.chapterTitle}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                        <span className="text-xs text-gray-400 block">
                          {new Date(
                            submission.submittedAt,
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          submission.status === "graded"
                            ? "bg-green-100 text-green-700 hover:bg-green-200 border-0"
                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0"
                        }
                      >
                        {submission.status === "graded"
                          ? "Graded"
                          : "Submitted"}
                      </Badge>
                      {submission.grade && (
                        <span className="ml-2 text-sm font-semibold text-gray-700">
                          {submission.grade}/100
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#8A63FF] border-[#8A63FF] hover:bg-purple-50"
                        onClick={() =>
                          window.open(submission.submissionLink, "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Work
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-[#8A63FF] hover:bg-[#7c58e6] ml-2"
                        onClick={() => handleGradeClick(submission)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Grade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-gray-500"
                  >
                    No submissions found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Grading Dialog */}
        <Dialog open={gradingOpen} onOpenChange={setGradingOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Grade Assignment</DialogTitle>
              <DialogDescription>
                Review and grade the submission for{" "}
                {selectedSubmission?.studentName}.
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Assignment</Label>
                  <div className="col-span-3 font-medium text-sm">
                    {selectedSubmission.assignmentTitle}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Link</Label>
                  <div className="col-span-3">
                    <a
                      href={selectedSubmission.submissionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      Open Submission <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="grade" className="text-right">
                    Score (0-10)
                  </Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="10"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter score"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="feedback" className="text-right mt-2">
                    Feedback
                  </Label>
                  <ReactQuill
                    theme="snow"
                    value={feedback}
                    onChange={setFeedback}
                    className="col-span-3 bg-white"
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "clean"],
                      ],
                    }}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setGradingOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitGrade}
                disabled={submittingGrade}
                className="bg-[#8A63FF] hover:bg-[#7c58e6]"
              >
                {submittingGrade ? <Spinner className="h-4 w-4 mr-2" /> : null}
                Save Grade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CourseSubmissionsPage;

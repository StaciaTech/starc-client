import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Clock,
  ListChecks,
  Loader2,
  Send,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import learningService from "@/services/learningService";
import { CourseStructure } from "@/services/courseStructureService";

interface AssignmentsTabProps {
  courseId: string;
  courseStructure: CourseStructure | null;
  courseStartDate: Date | null;
}

const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  courseId,
  courseStructure,
  courseStartDate,
}) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionLinks, setSubmissionLinks] = useState<{
    [key: string]: string;
  }>({});
  const [submittingIds, setSubmittingIds] = useState<string[]>([]);

  // Fetch assignments
  useEffect(() => {
    if (courseId) {
      setLoading(true);
      learningService
        .getAssignments(courseId)
        .then((data) => {
          setAssignments(data);
        })
        .catch((err) => console.error("Failed to load assignments", err))
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  const handleLinkChange = (assignmentId: string, value: string) => {
    setSubmissionLinks((prev) => ({ ...prev, [assignmentId]: value }));
  };

  const handleSubmitAssignment = async (
    assignmentId: string,
    chapterId: string,
  ) => {
    const link = submissionLinks[assignmentId];
    if (!link) {
      toast.error("Please enter a valid submission link");
      return;
    }

    // Basic URL validation
    try {
      new URL(link);
    } catch (_) {
      toast.error("Please enter a valid URL (e.g., https://...)");
      return;
    }

    try {
      setSubmittingIds((prev) => [...prev, assignmentId]);
      await learningService.submitAssignment(courseId, chapterId, link);
      toast.success("Assignment submitted successfully!");

      // Update local state
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId
            ? {
                ...a,
                status: "submitted",
                submissionLink: link,
                submittedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
    } catch (error: any) {
      console.error("Submission failed", error);
      toast.error(error.message || "Failed to submit assignment");
    } finally {
      setSubmittingIds((prev) => prev.filter((id) => id !== assignmentId));
    }
  };

  // Helper to check unlock status
  const getUnlockStatus = (chapterId: string) => {
    if (!courseStructure) return { locked: true, unlockDate: null };

    // If no start date, default to locked to prevent premature access
    if (!courseStartDate) return { locked: true, unlockDate: null };

    const chapterIndex = courseStructure.chapters.findIndex(
      (c) => c._id === chapterId,
    );

    if (chapterIndex === -1) return { locked: true, unlockDate: null };

    // Formula: UnlockDate = StartDate + (2 * ChapterNumber - 1) Weeks
    // ChapterNumber is 1-based index (chapterIndex + 1)

    // DEBUG LOG
    console.log("Checking Chapter", chapterIndex, "Start:", courseStartDate);

    // Original plan had 2*n - 1 (1, 3, 5...).
    // User requested: "1st assignment should be unlocked 1week from the batch start date" and "gap between each assignment should be 2weeks"
    // So:
    // Ch 1 (n=1): 1 week
    // Ch 2 (n=2): 3 weeks (1 + 2)
    // Ch 3 (n=3): 5 weeks (3 + 2)
    // Formula: 2n - 1 matches.

    const weeksToUnlock = 2 * (chapterIndex + 1) - 1;

    const unlockDate = new Date(courseStartDate);
    unlockDate.setDate(unlockDate.getDate() + weeksToUnlock * 7);

    const now = new Date();
    const locked = now < unlockDate;

    console.log(
      `Chapter ${chapterIndex + 1} unlocks on ${unlockDate.toLocaleDateString()}, Locked? ${locked} (Start: ${courseStartDate})`,
    );

    return { locked, unlockDate };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A63FF]" />
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">
          No Assignments Yet
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mt-1">
          Assignments will appear here as you progress through the course
          content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <ClipboardList className="h-6 w-6 text-[#8A63FF]" />
        <h2 className="text-xl font-bold text-gray-900">Chapter Assignments</h2>
      </div>
      <p className="text-sm text-gray-500">
        Each chapter has one assignment. Complete the tasks to deepen your
        understanding.
      </p>

      <div className="space-y-4">
        {assignments.map((assignment, aIdx) => {
          const { locked, unlockDate } = getUnlockStatus(assignment.chapterId);

          const diffColor =
            assignment.difficulty === "Easy"
              ? "bg-green-100 text-green-700"
              : assignment.difficulty === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";

          const isSubmitted =
            assignment.status === "submitted" || assignment.status === "graded";
          const isSubmitting = submittingIds.includes(assignment._id);

          return (
            <div
              key={assignment._id}
              className={`border rounded-xl bg-white overflow-hidden transition-shadow ${
                locked ? "opacity-75" : "hover:shadow-md"
              }`}
            >
              {/* Header */}
              <div
                className={`px-5 py-4 ${
                  locked
                    ? ""
                    : "border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50"
                } ${locked ? "bg-gray-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`${
                        locked
                          ? "bg-gray-200 text-gray-500"
                          : "bg-[#8A63FF] text-white"
                      } h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}
                    >
                      {aIdx + 1}
                    </span>
                    <div>
                      <h3
                        className={`font-semibold text-base ${
                          locked ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Chapter{" "}
                        {assignment.chapterId ? assignment.chapterTitle : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {unlockDate && (
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-0 text-xs font-medium"
                      >
                        Available: {unlockDate.toLocaleDateString("en-GB")}
                      </Badge>
                    )}
                    {locked ? (
                      <Badge className="bg-gray-200 text-gray-600 border-0">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    ) : (
                      <>
                        {isSubmitted && (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            Submitted
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`${diffColor} border-0 text-xs font-medium`}
                        >
                          {assignment.difficulty}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-0 text-xs font-medium"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {assignment.estimatedDuration}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Body - Only shown if UNLOCKED */}
              {!locked && (
                <div className="px-5 py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {assignment.description}
                  </p>

                  {/* Tasks */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-[#8A63FF]" />
                      Tasks to Complete
                    </h4>
                    {assignment.tasks &&
                      assignment.tasks.map((task: string, tIdx: number) => (
                        <div
                          key={tIdx}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="bg-white border border-gray-200 text-gray-500 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {tIdx + 1}
                          </span>
                          <p className="text-sm text-gray-700">{task}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Submit Link */}
              {!locked && (
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  {isSubmitted ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Submission
                      </div>
                      <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                        <a
                          href={assignment.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#8A63FF] hover:underline truncate max-w-[300px]"
                        >
                          {assignment.submissionLink}
                        </a>
                        <span className="text-xs text-gray-400">
                          {new Date(
                            assignment.submittedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {assignment.grade && (
                        <div className="bg-green-50 p-3 rounded-md border border-green-100 mt-2">
                          <p className="text-sm text-green-800 font-medium">
                            Grade: {assignment.grade}
                          </p>
                          {assignment.feedback && (
                            <div
                              className="text-xs text-green-700 mt-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: assignment.feedback,
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-end gap-3 transition-opacity">
                      <div className="flex-1 space-y-1.5">
                        <label
                          htmlFor={`link-${assignment._id}`}
                          className="text-xs font-medium text-gray-700 ml-1"
                        >
                          Submission Link (Google Drive, GitHub, etc.)
                        </label>
                        <Input
                          id={`link-${assignment._id}`}
                          placeholder="https://..."
                          value={submissionLinks[assignment._id] || ""}
                          onChange={(e) =>
                            handleLinkChange(assignment._id, e.target.value)
                          }
                          className="bg-white"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        onClick={() =>
                          handleSubmitAssignment(
                            assignment._id,
                            assignment.chapterId,
                          )
                        }
                        disabled={
                          !submissionLinks[assignment._id] || isSubmitting
                        }
                        className="bg-[#8A63FF] hover:bg-[#7a52e6] text-white min-w-[100px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentsTab;

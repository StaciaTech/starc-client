import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Calendar, 
  Edit, 
  FileText, 
  Plus, 
  Trash2, 
  ChevronUp,
  ChevronDown,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  Assignment, 
  getAllAssignments, 
  createAssignment, 
  updateAssignment, 
  deleteAssignment, 
  reorderAssignments,
  getAllSubmissions,
  AssignmentSubmission,
  provideSubmissionFeedback
} from '@/services/assignmentService';

interface AssignmentsManagerProps {
  courseId: string;
}

const AssignmentsManager: React.FC<AssignmentsManagerProps> = ({ courseId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState<string>('');
  
  // Operation states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await getAllAssignments(courseId);
        setAssignments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments. Please try again later.');
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
    setTitle(assignment.title);
    setDescription(assignment.description);
    setInstructions(assignment.instructions);
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
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again later.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleFeedbackClick = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || '');
    setGrade(submission.grade?.toString() || '');
    setFeedbackDialogOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setInstructions('');
    setDeadline('');
    setIsPublished(false);
    setFormError(null);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (!description.trim()) {
      setFormError('Description is required');
      return false;
    }
    if (!instructions.trim()) {
      setFormError('Instructions are required');
      return false;
    }
    if (!deadline) {
      setFormError('Deadline is required');
      return false;
    }
    
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      setFormError('Please enter a valid deadline date');
      return false;
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
        deadline
      });
      
      setAssignments([...assignments, newAssignment]);
      setCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating assignment:', err);
      setFormError(err.response?.data?.message || 'Failed to create assignment. Please try again.');
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
        isPublished
      });
      
      setAssignments(
        assignments.map(a => 
          a._id === updatedAssignment._id ? updatedAssignment : a
        )
      );
      
      setEditDialogOpen(false);
    } catch (err: any) {
      console.error('Error updating assignment:', err);
      setFormError(err.response?.data?.message || 'Failed to update assignment. Please try again.');
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
        assignments.filter(a => a._id !== selectedAssignment._id)
      );
      
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      setError('Failed to delete assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission) return;
    
    // Validate grade if provided
    if (grade && (isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 100)) {
      setFormError('Grade must be a number between 0 and 100');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError(null);
      
      const updatedSubmission = await provideSubmissionFeedback(
        selectedSubmission._id,
        feedback,
        grade ? Number(grade) : undefined
      );
      
      // Update the submission in the list
      setSubmissions(
        submissions.map(s => 
          s._id === updatedSubmission._id ? updatedSubmission : s
        )
      );
      
      setFeedbackDialogOpen(false);
    } catch (err: any) {
      console.error('Error providing feedback:', err);
      setFormError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    
    const reorderedAssignments = Array.from(assignments);
    const temp = reorderedAssignments[index];
    reorderedAssignments[index] = reorderedAssignments[index - 1];
    reorderedAssignments[index - 1] = temp;
    
    // Update local state immediately for better UX
    setAssignments(reorderedAssignments);
    
    // Send reorder request to backend
    try {
      const assignmentIds = reorderedAssignments.map(a => a._id);
      await reorderAssignments(courseId, assignmentIds);
    } catch (err) {
      console.error('Error reordering assignments:', err);
      setError('Failed to reorder assignments. Please try again.');
      
      // Fetch assignments again to reset order
      const data = await getAllAssignments(courseId);
      setAssignments(data);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= assignments.length - 1) return;
    
    const reorderedAssignments = Array.from(assignments);
    const temp = reorderedAssignments[index];
    reorderedAssignments[index] = reorderedAssignments[index + 1];
    reorderedAssignments[index + 1] = temp;
    
    // Update local state immediately for better UX
    setAssignments(reorderedAssignments);
    
    // Send reorder request to backend
    try {
      const assignmentIds = reorderedAssignments.map(a => a._id);
      await reorderAssignments(courseId, assignmentIds);
    } catch (err) {
      console.error('Error reordering assignments:', err);
      setError('Failed to reorder assignments. Please try again.');
      
      // Fetch assignments again to reset order
      const data = await getAllAssignments(courseId);
      setAssignments(data);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatDateForInput = (dateString: string | Date) => {
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  if (loading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assignments</h2>
        <Button onClick={handleCreateClick} disabled={assignments.length >= 5}>
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
      
      {assignments.length === 0 ? (
        <Alert className="my-4">
          <FileText className="h-4 w-4" />
          <AlertTitle>No Assignments</AlertTitle>
          <AlertDescription>There are no assignments for this course yet. Click "Add Assignment" to create one.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <Card key={assignment._id} className="relative">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col space-y-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleMoveDown(index)}
                  disabled={index === assignments.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              
              <CardHeader className="pl-12">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{assignment.title}</CardTitle>
                    <CardDescription>
                      Due: {formatDate(assignment.deadline)}
                    </CardDescription>
                  </div>
                  <Badge variant={assignment.isPublished ? "default" : "outline"}>
                    {assignment.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Unlocks on {formatDate(assignment.unlockDate)}</span>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewSubmissionsClick(assignment)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Submissions
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditClick(assignment)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteClick(assignment)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Assignment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Add a new assignment to this course. Students will see it when it's published.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the assignment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Detailed instructions for completing the assignment"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                The assignment will unlock automatically 7 days before this deadline.
              </p>
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
              onClick={() => setCreateDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Assignment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update the assignment details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description of the assignment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-instructions">Instructions</Label>
              <Textarea
                id="edit-instructions"
                placeholder="Detailed instructions for completing the assignment"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                The assignment will unlock automatically 7 days before this deadline.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="published">Published</Label>
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
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
              All student submissions for this assignment will also be deleted.
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
              {submitting ? 'Deleting...' : 'Delete Assignment'}
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
            <DialogTitle>
              {selectedAssignment?.title} - Submissions
            </DialogTitle>
            <DialogDescription>
              View all student submissions for this assignment.
            </DialogDescription>
          </DialogHeader>
          
          {loadingSubmissions ? (
            <div className="p-4 text-center">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="p-4 text-center">
              No submissions for this assignment yet.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Submission</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Grade</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="border-b">
                      <td className="p-2">
                        {typeof submission.userId === 'object' && submission.userId !== null ? (
                          <>
                            <div>{(submission.userId as any).name}</div>
                            <div className="text-xs text-gray-500">{(submission.userId as any).email}</div>
                          </>
                        ) : (
                          'Unknown User'
                        )}
                      </td>
                      <td className="p-2">
                        <a 
                          href={submission.submissionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Submission
                        </a>
                      </td>
                      <td className="p-2">
                        {format(new Date(submission.submissionDate), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="p-2">
                        {submission.grade !== undefined ? `${submission.grade}/100` : 'Not graded'}
                      </td>
                      <td className="p-2 text-right">
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
            <Button 
              onClick={() => setSubmissionsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Add feedback and grade for this submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Submission URL:</p>
              <a 
                href={selectedSubmission?.submissionUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {selectedSubmission?.submissionUrl}
              </a>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide feedback on the submission"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade">Grade (0-100)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                placeholder="Grade (optional)"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
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
            <Button 
              onClick={handleSubmitFeedback}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsManager; 
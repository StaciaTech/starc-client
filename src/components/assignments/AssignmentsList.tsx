import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { 
  Assignment, 
  getAssignments, 
  submitAssignment, 
  getUserSubmissions, 
  AssignmentSubmission 
} from '@/services/assignmentService';
import { format } from 'date-fns';

interface AssignmentsListProps {
  courseId: string;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({ courseId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await getAssignments(courseId);
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

  // Get submission status for each assignment
  useEffect(() => {
    const fetchSubmissions = async () => {
      const submissionsData: Record<string, AssignmentSubmission[]> = {};
      
      for (const assignment of assignments) {
        try {
          const assignmentSubmissions = await getUserSubmissions(assignment._id);
          submissionsData[assignment._id] = assignmentSubmissions;
        } catch (err) {
          console.error(`Error fetching submissions for assignment ${assignment._id}:`, err);
        }
      }
      
      setSubmissions(submissionsData);
    };

    if (assignments.length > 0) {
      fetchSubmissions();
    }
  }, [assignments]);

  const handleSubmitClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionUrl('');
    setSubmissionError(null);
    setSubmissionSuccess(false);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    
    // Basic URL validation
    if (!submissionUrl.trim()) {
      setSubmissionError('Please enter a submission URL');
      return;
    }

    if (!submissionUrl.startsWith('http://') && !submissionUrl.startsWith('https://')) {
      setSubmissionError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionError(null);
      
      const response = await submitAssignment(selectedAssignment._id, submissionUrl);
      
      // Update submissions for this assignment
      const updatedSubmissions = await getUserSubmissions(selectedAssignment._id);
      setSubmissions({
        ...submissions,
        [selectedAssignment._id]: updatedSubmissions
      });
      
      setSubmissionSuccess(true);
      
      // Close dialog after a short delay
      setTimeout(() => {
        setDialogOpen(false);
        setSubmissionSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setSubmissionError(err.response?.data?.message || 'Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const unlockDate = new Date(assignment.unlockDate);
    
    const assignmentSubmissions = submissions[assignment._id] || [];
    const hasSubmission = assignmentSubmissions.length > 0;
    
    if (now < unlockDate) {
      return { status: 'locked', label: 'Locked', color: 'bg-gray-500' };
    } else if (now > deadline) {
      return { 
        status: hasSubmission ? 'submitted' : 'late', 
        label: hasSubmission ? 'Submitted' : 'Late Submission Available', 
        color: hasSubmission ? 'bg-green-500' : 'bg-amber-500' 
      };
    } else {
      return { 
        status: hasSubmission ? 'submitted' : 'open', 
        label: hasSubmission ? 'Submitted' : 'Open', 
        color: hasSubmission ? 'bg-green-500' : 'bg-blue-500' 
      };
    }
  };

  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatDateTime = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const getTimeRemaining = (deadline: string | Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Deadline passed';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (assignments.length === 0) {
    return (
      <Alert className="my-4">
        <FileText className="h-4 w-4" />
        <AlertTitle>No Assignments</AlertTitle>
        <AlertDescription>There are no assignments available for this course yet.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Assignments</h2>
      
      {assignments.map((assignment) => {
        const { status, label, color } = getAssignmentStatus(assignment);
        const assignmentSubmissions = submissions[assignment._id] || [];
        const latestSubmission = assignmentSubmissions.find(sub => sub.isLatest);
        
        return (
          <Card key={assignment._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{assignment.title}</CardTitle>
                <Badge className={color}>{label}</Badge>
              </div>
              <CardDescription>
                Due: {formatDate(assignment.deadline)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {status === 'open' ? (
                    <>Time remaining: {getTimeRemaining(assignment.deadline)}</>
                  ) : status === 'locked' ? (
                    <>Unlocks on {formatDate(assignment.unlockDate)}</>
                  ) : (
                    <>Deadline: {formatDate(assignment.deadline)}</>
                  )}
                </span>
              </div>
              
              {assignmentSubmissions.length > 0 && (
                <Accordion type="single" collapsible className="mt-2">
                  <AccordionItem value="submissions">
                    <AccordionTrigger className="text-sm">
                      Your Submissions ({assignmentSubmissions.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {assignmentSubmissions.map((submission) => (
                          <div 
                            key={submission._id} 
                            className={`p-2 rounded-md border ${submission.isLatest ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                          >
                            <div className="flex justify-between items-center">
                              <a 
                                href={submission.submissionUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {submission.submissionUrl}
                              </a>
                              <div className="flex gap-2">
                                {submission.isLatest && (
                                  <Badge variant="outline" className="border-green-500 text-green-700">
                                    Latest
                                  </Badge>
                                )}
                                {submission.isLateSubmission && (
                                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                                    Late
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Submitted on {formatDateTime(submission.submissionDate)}
                            </p>
                            {submission.feedback && (
                              <div className="mt-2 p-2 bg-gray-100 rounded-md">
                                <p className="text-xs font-semibold">Feedback:</p>
                                <p className="text-sm">{submission.feedback}</p>
                                {submission.grade !== undefined && (
                                  <p className="text-sm font-semibold mt-1">
                                    Grade: {submission.grade}/100
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
            
            <CardFooter>
              {status === 'open' && (
                <Button 
                  onClick={() => handleSubmitClick(assignment)}
                  className="w-full"
                >
                  {assignmentSubmissions.length > 0 ? 'Update Submission' : 'Submit Assignment'}
                </Button>
              )}
              
              {status === 'locked' && (
                <Button disabled className="w-full">
                  Unlocks on {formatDate(assignment.unlockDate)}
                </Button>
              )}
              
              {status === 'submitted' && (
                <Button 
                  onClick={() => handleSubmitClick(assignment)}
                  className="w-full bg-green-500"
                >
                  Update Submission
                </Button>
              )}
              
              {status === 'late' && (
                <Button 
                  onClick={() => handleSubmitClick(assignment)}
                  className="w-full bg-amber-500"
                >
                  {assignmentSubmissions.length > 0 ? 'Update Late Submission' : 'Submit Late'}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAssignment?.title} - Submit Assignment
            </DialogTitle>
            <DialogDescription>
              Enter the URL where your assignment can be accessed.
              <br />
              <span className="text-sm text-gray-500">
                This could be a GitHub repository, Google Doc, or any other publicly accessible link.
              </span>
            </DialogDescription>
          </DialogHeader>
          
          {submissionSuccess ? (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-center font-medium">
                {new Date() > new Date(selectedAssignment?.deadline || '') 
                  ? 'Late submission received successfully!'
                  : 'Assignment submitted successfully!'}
              </p>
              {new Date() > new Date(selectedAssignment?.deadline || '') && (
                <p className="text-center text-amber-600 text-sm mt-1">
                  Note: This submission was made after the deadline.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="submissionUrl">Submission URL</Label>
                  <Input
                    id="submissionUrl"
                    placeholder="https://..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                  />
                </div>
                
                {submissionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submissionError}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsList; 
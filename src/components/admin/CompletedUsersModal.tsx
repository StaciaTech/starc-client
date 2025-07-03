import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import courseService from '@/services/courseService';

interface CompletedUser {
  userId: string;
  userName: string;
  userEmail: string;
  username: string;
  progress: number;
  completionDate: string;
  startDate: string;
  completedAfterAdminMark: boolean;
  adminMarkCompletionTimestamp?: string;
}

interface CompletedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

const CompletedUsersModal: React.FC<CompletedUsersModalProps> = ({
  isOpen,
  onClose,
  courseId,
}) => {
  const [users, setUsers] = useState<CompletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchCompletedUsers();
    }
  }, [isOpen, courseId]);

  const fetchCompletedUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const completedUsers = await courseService.getCompletedCourseUsers(courseId);
      setUsers(completedUsers);
    } catch (err) {
      console.error('Error fetching completed users:', err);
      setError('Failed to load completed users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Completed Users</DialogTitle>
          <DialogDescription>
            Users who have completed this course
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8 text-[#8A63FF]" />
            <span className="ml-2">Loading users...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users have completed this course yet.
          </div>
        ) : (
          <ScrollArea className="h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.userName}</TableCell>
                    <TableCell>{user.userEmail}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.progress}%</TableCell>
                    <TableCell>{formatDate(user.startDate)}</TableCell>
                    <TableCell>{formatDate(user.completionDate)}</TableCell>
                    <TableCell>
                      {user.completedAfterAdminMark ? (
                        <Badge className="bg-green-100 text-green-800">Official</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800">
                          Completed Content
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={fetchCompletedUsers} 
            disabled={loading}
            className="bg-[#8A63FF] hover:bg-[#7A53EF]"
          >
            Refresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompletedUsersModal; 
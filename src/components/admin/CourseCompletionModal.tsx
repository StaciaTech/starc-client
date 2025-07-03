import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { completionAnnouncement: string, isCompleted: boolean }) => Promise<void>;
  initialAnnouncement?: string;
  initialIsCompleted?: boolean;
}

const CourseCompletionModal: React.FC<CourseCompletionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAnnouncement = '',
  initialIsCompleted = false
}) => {
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSave({ completionAnnouncement: announcement, isCompleted });
      toast.success('Course completion settings saved');
      onClose();
    } catch (error) {
      console.error('Error saving course completion settings:', error);
      toast.error('Failed to save course completion settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Course Completion Settings</DialogTitle>
          <DialogDescription>
            Set a completion announcement and mark the course as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="announcement">Completion Announcement</Label>
            <Textarea
              id="announcement"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Enter a message to display to students when they complete the course"
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              This message will be displayed to students when they complete the course.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="isCompleted" 
              checked={isCompleted} 
              onCheckedChange={setIsCompleted} 
            />
            <Label htmlFor="isCompleted">Mark course as completed/ended</Label>
          </div>
          
          {isCompleted && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> Marking a course as completed will prevent students from enrolling in it.
                Students who have made significant progress (over 70%) will automatically have their status set to completed.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-[#8A63FF] hover:bg-[#7A53EF]"
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseCompletionModal; 
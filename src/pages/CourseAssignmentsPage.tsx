import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import courseService from '@/services/courseService';
import AssignmentsList from '@/components/assignments/AssignmentsList';

const CourseAssignmentsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [courseTitle, setCourseTitle] = useState<string>('');
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(courseId);
        setCourseTitle(courseData.title);
      } catch (error) {
        console.error('Error loading course details:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [courseId]);
  
  const navigateBack = () => {
    navigate(`/course/${courseId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <Spinner className="h-8 w-8" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center"
          onClick={navigateBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{courseTitle} - Assignments</CardTitle>
            <CardDescription>
              Complete and submit your assignments for this course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssignmentsList courseId={courseId || ''} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseAssignmentsPage; 
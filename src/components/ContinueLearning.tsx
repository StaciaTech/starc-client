import React, { useState, useEffect } from 'react';
import { getEnrolledCourses } from '@/services/profileService';
import DashboardCard from './DashboardCard';

// Import default course image for fallbacks only
import defaultCourseImage from '../Assets/icons/course1.svg';

interface Course {
  id: string;
  title: string;
  duration: string;
  progress: number;
  image?: string;
  status: string;
  description?: string;
  instructor?: string;
}

const ContinueLearning: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch enrolled courses from API
        const coursesData = await getEnrolledCourses();
        
        if (coursesData && coursesData.length > 0) {
          // Use the data exactly as it comes from the backend
          // Just add a default image as a fallback if none is provided
          const processedCourses = coursesData.map((course: Course) => ({
            ...course,
            // Only use defaultCourseImage as a fallback
            image: course.image || defaultCourseImage
          }));
          
          setCourses(processedCourses);
        } else {
          // No courses found
          setCourses([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setError('Failed to fetch courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Log the courses data to help with debugging
  useEffect(() => {
    console.log('Current courses data:', courses);
  }, [courses]);

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading courses...</p>
        </div>
      ) : error ? (
        <div>
          <p className="text-amber-500 mb-4">{error}</p>
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Courses</h3>
            <p className="text-gray-500">Please try again later.</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Found</h3>
          <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <DashboardCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContinueLearning; 
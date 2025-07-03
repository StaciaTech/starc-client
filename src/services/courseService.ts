import axios from 'axios';
import { getAuthHeader } from '@/utils/authUtils';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { handleApiError } from '@/utils/apiUtils';

// Fallback API URL in case proxy fails
const FALLBACK_API_URL = 'https://server.edifai.in';

// Course interfaces
export interface ICourse {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  instructor: any;
  price: number;
  discount?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  lessons: ILesson[];
  enrolledUsers: string[];
  rating: number;
  reviews: IReview[];
  discountedPrice?: number;
  completionAnnouncement?: string;
  isCompleted?: boolean;
}

export interface ILesson {
  _id: string;
  title: string;
  content: string;
  duration: number;
  order: number;
  videoUrl?: string;
  resources?: { title: string; url: string }[];
}

export interface IReview {
  user: any;
  rating: number;
  comment: string;
  createdAt: string;
}

// Mentor interfaces
export interface IMentor {
  _id: string;
  name: string;
  bio: string;
  avatar: string;
  expertise: string[];
  rating: number;
  courseCount: number;
  studentCount: number;
}

// API endpoints - using the direct fallback URL
const API_ENDPOINT = `${FALLBACK_API_URL}/api/courses`;
const MENTORS_ENDPOINT = `${FALLBACK_API_URL}/api/mentors`;

// Get all courses
export const getCourses = async (): Promise<ICourse[]> => {
  try {
    console.log("Attempting to fetch courses from:", API_ENDPOINT);
    const headers = await getAuthHeader();
    
    const response = await axios.get(API_ENDPOINT, { 
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    
    // Check if it's a network error
    if (error.message === 'Network Error') {
      toast.error('Cannot connect to server. Please check your internet connection.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Server may be down or unreachable.');
    } else if (error.response) {
      toast.error(`Server error: ${error.response.status}. Please try again later.`);
    } else if (error.request) {
      toast.error('No response from server. Please try again later.');
    }
    
    return [];
  }
};

// Get course by id
export const getCourseById = async (id: string): Promise<ICourse> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${API_ENDPOINT}/${id}`, { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// Create a new course
export const createCourse = async (courseData: Partial<ICourse>): Promise<ICourse> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(API_ENDPOINT, courseData, { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Update a course
export const updateCourse = async (id: string, courseData: Partial<ICourse>): Promise<ICourse> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.put(`${API_ENDPOINT}/${id}`, courseData, { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (id: string): Promise<void> => {
  try {
    const headers = await getAuthHeader();
    await axios.delete(`${API_ENDPOINT}/${id}`, { headers });
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Enroll in a course
export const enrollInCourse = async (courseId: string): Promise<ICourse> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.put(`${API_ENDPOINT}/${courseId}/enroll`, {}, { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

// Add a review to a course
export const addCourseReview = async (courseId: string, rating: number, comment: string): Promise<ICourse> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(`${API_ENDPOINT}/${courseId}/reviews`, { rating, comment }, { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error adding course review:', error);
    throw error;
  }
};

// Get all mentors
export const getMentors = async (): Promise<IMentor[]> => {
  try {
    console.log("Attempting to fetch mentors from:", MENTORS_ENDPOINT);
    const headers = await getAuthHeader();
    console.log("Using headers:", headers);
    
    const response = await axios.get(MENTORS_ENDPOINT, { 
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    console.log("Mentors API response:", response.status, response.data);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching mentors:', error);
    
    // Check if it's a network error
    if (error.message === 'Network Error') {
      console.error('Network connectivity issue detected');
      toast.error('Cannot connect to server. Please check your internet connection.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      toast.error('Request timed out. Server may be down or unreachable.');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with error:', error.response.status, error.response.data);
      toast.error(`Server error: ${error.response.status}. Please try again later.`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      toast.error('No response from server. Please try again later.');
    }
    
    return [];
  }
};

// Get mentor by id
export const getMentorById = async (id: string): Promise<IMentor> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${MENTORS_ENDPOINT}/${id}`, { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching mentor details:', error);
    throw error;
  }
};

// Get mentor courses
export const getMentorCourses = async (mentorId: string): Promise<ICourse[]> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${MENTORS_ENDPOINT}/${mentorId}/courses`, { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching mentor courses:', error);
    throw error;
  }
};

// Set course completion announcement and status
export const setCourseCompletion = async (courseId: string, data: { completionAnnouncement?: string, isCompleted?: boolean }): Promise<any> => {
  try {
    const response = await axios.put(
      `${FALLBACK_API_URL}/api/courses/${courseId}/completion`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to update course completion status');
  }
};

// Get completed users for a course (admin only)
export const getCompletedCourseUsers = async (courseId: string): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${FALLBACK_API_URL}/api/courses/${courseId}/completed-users`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data.data || [];
  } catch (error) {
    throw handleApiError(error, 'Failed to get completed course users');
  }
};

// Create default export with all functions
const courseService = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  addCourseReview,
  getMentors,
  getMentorById,
  getMentorCourses,
  setCourseCompletion,
  getCompletedCourseUsers
};

export default courseService; 
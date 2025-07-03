import axios from 'axios';
import { handleApiError, hasValidToken } from '@/utils/apiUtils';
import { API_URL } from '@/config/api';

// Fallback API URL in case proxy fails
const FALLBACK_API_URL = 'https://server.edifai.in';

// Type definitions
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  learningHours: number;
  certificatesEarned: number;
  coursesEnrolled: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  // Additional profile fields
  avatar?: string;
  location?: string;
  dateOfBirth?: string;
  phone?: string;
  username?: string;
}

export interface ScheduleEvent {
  _id: string;
  title: string;
  dueDate: string;
  time: string;
  description: string;
  color: string;
  userId: string;
}

// Update API URLs to use correct endpoints
const AUTH_API_URL = `${FALLBACK_API_URL}/api/auth`;
const PROFILE_API_URL = `${FALLBACK_API_URL}/api/profile`;

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: string;
  username?: string;
  avatar?: string;
  location?: string;
  dateOfBirth?: string;
  phone?: string;
  bio?: string;
}

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    // First try the profile endpoint
    try {
      const response = await axios.get(`${PROFILE_API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (profileError) {
      console.log('Could not fetch from profile API, falling back to auth/me', profileError);
      // Fall back to the auth/me endpoint
    }

    // Use the auth/me endpoint as fallback to get user info
    const response = await axios.get(`${AUTH_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return a default profile rather than throwing an error
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return {
          _id: userData._id || '',
          name: userData.name || 'Student',
          email: userData.email || '',
          role: userData.role || 'user'
        };
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
    
    return {
      _id: '',
      name: 'Student',
      email: '',
      role: 'user'
    };
  }
};

// Update user profile
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    // Use the auth/profile endpoint to update user profile
    const response = await axios.put(`${AUTH_API_URL}/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // After successful update, update the local storage user data
    if (response.data.success && response.data.data) {
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const updatedUser = {
          ...userData,
          name: profileData.name || userData.name,
          email: profileData.email || userData.email
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }

    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Error updating user profile');
  }
};

// Get user schedule events
export const getUserSchedule = async (): Promise<ScheduleEvent[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await axios.get(`${FALLBACK_API_URL}/api/users/schedule`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user schedule:', error);
    return []; // Return empty array on error instead of throwing
  }
};

// Add a schedule event
export const addScheduleEvent = async (eventData: Omit<ScheduleEvent, '_id'>): Promise<ScheduleEvent> => {
  try {
    const response = await axios.post(`${FALLBACK_API_URL}/api/schedule`, eventData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding schedule event:', error);
    throw error;
  }
};

// Update a schedule event
export const updateScheduleEvent = async (eventId: string, eventData: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
  try {
    const response = await axios.put(`${FALLBACK_API_URL}/api/schedule/${eventId}`, eventData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating schedule event:', error);
    throw error;
  }
};

// Delete a schedule event
export const deleteScheduleEvent = async (eventId: string): Promise<void> => {
  try {
    await axios.delete(`${FALLBACK_API_URL}/api/schedule/${eventId}`);
  } catch (error) {
    console.error('Error deleting schedule event:', error);
    throw error;
  }
};

// Get enrolled courses
export const getEnrolledCourses = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await axios.get(`${FALLBACK_API_URL}/api/courses/enrolled`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return []; // Return empty array on error instead of throwing
  }
};

// Get user's activity/progress
export const getUserActivity = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.get(`${FALLBACK_API_URL}/api/profile/activity`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.data || {
      learningHours: 0,
      certificatesEarned: 0,
      coursesEnrolled: 0,
      progress: 0,
      recentActivity: []
    };
  } catch (error) {
    console.error('Error fetching user activity:', error);
    // Return empty values on error
    return {
      learningHours: 0,
      certificatesEarned: 0,
      coursesEnrolled: 0,
      progress: 0,
      recentActivity: []
    };
  }
};

// Update course progress
export const updateCourseProgress = async (
  courseId: string, 
  progressData: { 
    progress?: number; 
    currentLesson?: number;
    completed?: boolean;
    completedSections?: string[];
  }
): Promise<any> => {
  try {
    // Check if token is valid
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }

    const token = localStorage.getItem('token');
    
    const response = await axios.put(
      `${FALLBACK_API_URL}/api/courses/${courseId}/progress`, 
      progressData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw handleApiError(error, 'Failed to update course progress');
  }
};

export const uploadProfilePicture = async (file: File): Promise<{ avatar: string }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${PROFILE_API_URL}/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Error uploading profile picture');
  }
};

// Get user course details including completed sections and quizzes
export const getUserCourseDetails = async (courseId: string): Promise<any> => {
  try {
    // Check if token is valid
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }

    const token = localStorage.getItem('token');
    
    const response = await axios.get(
      `${FALLBACK_API_URL}/api/courses/${courseId}/user-details`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user course details:', error);
    // Return empty default values instead of throwing to prevent UI errors
    return {
      progress: 0,
      completed: false,
      currentLesson: 0,
      completedSections: [],
      completedQuizzes: []
    };
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture
}; 
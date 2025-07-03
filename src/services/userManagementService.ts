import axios from 'axios';
import { handleApiError } from '@/utils/apiUtils';
import { getAuthHeader } from '@/utils/authUtils';

// Fallback API URL in case proxy fails
const FALLBACK_API_URL = 'https://server.edifai.in';

// API endpoint
const ADMIN_API_URL = `${FALLBACK_API_URL}/api/admin`;
const COURSES_API_URL = `${FALLBACK_API_URL}/api/courses`;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  enrollmentEnabled: boolean;
  assignedCourses?: string[];
  createdAt: string;
  updatedAt: string;
  location?: string;
  dateOfBirth?: string;
  phone?: string;
  avatar?: string;
  username?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: any;
  category: string;
  level: string;
  thumbnail?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  enrollmentEnabled?: boolean;
  assignedCourses?: string[];
}

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.get(`${ADMIN_API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    handleApiError(error, 'Error fetching users');
    return [];
  }
};

/**
 * Get all available courses
 */
export const getAvailableCourses = async (): Promise<Course[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.get(COURSES_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    handleApiError(error, 'Error fetching courses');
    return [];
  }
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.post(
      `${ADMIN_API_URL}/users`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Error creating user');
  }
};

/**
 * Assign courses to a user (admin only)
 */
export const assignCoursesToUser = async (userId: string, courseIds: string[]): Promise<User> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.put(
      `${ADMIN_API_URL}/users/${userId}/assign-courses`,
      { courses: courseIds },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Error assigning courses to user');
  }
};

/**
 * Toggle user enrollment access (admin only)
 */
export const toggleUserEnrollmentAccess = async (userId: string): Promise<User> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.put(
      `${ADMIN_API_URL}/users/${userId}/toggle-enrollment`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Error toggling user enrollment access');
  }
};

/**
 * Get user enrollment status (admin only)
 */
export const getUserEnrollmentStatus = async (userId: string): Promise<User> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.get(
      `${ADMIN_API_URL}/users/${userId}/enrollment-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Error getting user enrollment status');
  }
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (userId: string): Promise<{ success: boolean, message: string }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.delete(
      `${ADMIN_API_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    throw handleApiError(error, 'Error deleting user');
  }
};

export default {
  getAllUsers,
  getAvailableCourses,
  createUser,
  assignCoursesToUser,
  toggleUserEnrollmentAccess,
  getUserEnrollmentStatus,
  deleteUser
}; 
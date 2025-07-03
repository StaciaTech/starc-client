import axios from 'axios';
import { API_URL } from '@/config/api';
import { hasValidToken } from '@/utils/apiUtils';

// Use a fallback URL if API_URL is not available
const FALLBACK_API_URL = 'https://server.edifai.in';

// Define types
export interface Assignment {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  deadline: Date | string;
  unlockDate: Date | string;
  order: number;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AssignmentSubmission {
  _id: string;
  assignmentId: string;
  userId: string;
  courseId: string;
  submissionUrl: string;
  submissionDate: Date | string;
  isLatest: boolean;
  isLateSubmission: boolean;
  feedback?: string;
  grade?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  instructions: string;
  deadline: string;
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  instructions?: string;
  deadline?: string;
  isPublished?: boolean;
}

// API endpoints
const API_ENDPOINT = `${FALLBACK_API_URL}/api/assignments`;
const ADMIN_API_ENDPOINT = `${FALLBACK_API_URL}/api/admin/assignments`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all published assignments for a course
export const getAssignments = async (courseId: string): Promise<Assignment[]> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.get(
      `${API_ENDPOINT}/course/${courseId}`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

// Get a single assignment by ID
export const getAssignment = async (id: string): Promise<Assignment> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.get(
      `${API_ENDPOINT}/${id}`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    throw error;
  }
};

// Submit an assignment
export const submitAssignment = async (
  assignmentId: string,
  submissionUrl: string
): Promise<AssignmentSubmission> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.post(
      `${API_ENDPOINT}/${assignmentId}/submit`, 
      { submissionUrl },
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

// Get user's submissions for an assignment
export const getUserSubmissions = async (assignmentId: string): Promise<AssignmentSubmission[]> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.get(
      `${API_ENDPOINT}/${assignmentId}/submissions`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    throw error;
  }
};

// Admin functions

// Get all assignments for a course (including unpublished)
export const getAllAssignments = async (courseId: string): Promise<Assignment[]> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.get(
      `${ADMIN_API_ENDPOINT}/course/${courseId}`, 
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all assignments:', error);
    throw error;
  }
};

// Create a new assignment
export const createAssignment = async (
  courseId: string,
  assignmentData: CreateAssignmentData
): Promise<Assignment> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.post(
      `${ADMIN_API_ENDPOINT}/course/${courseId}`, 
      assignmentData, 
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// Update an assignment
export const updateAssignment = async (
  id: string,
  assignmentData: UpdateAssignmentData
): Promise<Assignment> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.put(
      `${ADMIN_API_ENDPOINT}/${id}`, 
      assignmentData, 
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

// Delete an assignment
export const deleteAssignment = async (id: string): Promise<void> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    await axios.delete(
      `${ADMIN_API_ENDPOINT}/${id}`, 
      getAuthHeaders()
    );
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

// Reorder assignments
export const reorderAssignments = async (
  courseId: string,
  assignmentIds: string[]
): Promise<Assignment[]> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.put(
      `${ADMIN_API_ENDPOINT}/course/${courseId}/reorder`, 
      { assignmentIds }, 
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error reordering assignments:', error);
    throw error;
  }
};

// Get all submissions for an assignment (admin only)
export const getAllSubmissions = async (assignmentId: string): Promise<AssignmentSubmission[]> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.get(
      `${ADMIN_API_ENDPOINT}/${assignmentId}/submissions`, 
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    throw error;
  }
};

// Provide feedback and grade for a submission
export const provideSubmissionFeedback = async (
  submissionId: string,
  feedback: string,
  grade?: number
): Promise<AssignmentSubmission> => {
  try {
    if (!hasValidToken()) {
      throw new Error('Authentication token is missing or expired');
    }
    
    const response = await axios.put(
      `${ADMIN_API_ENDPOINT}/submissions/${submissionId}`, 
      { feedback, grade }, 
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error providing submission feedback:', error);
    throw error;
  }
}; 
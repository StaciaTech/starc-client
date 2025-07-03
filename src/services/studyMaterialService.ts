import axios from 'axios';
import { getAuthHeader } from '@/utils/authUtils';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { handleApiError } from '@/utils/apiUtils';

// Fallback API URL in case proxy fails
const FALLBACK_API_URL = 'https://server.edifai.in';

// Study Material interfaces
export interface IStudyMaterial {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  type: 'file' | 'link';
  content: string;
  fileType?: string;
  fileSize?: number;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// API endpoints
const API_ENDPOINT = `${FALLBACK_API_URL}/api/study-materials`;
const ADMIN_API_ENDPOINT = `${FALLBACK_API_URL}/api/admin/study-materials`;

// Get all published study materials for a course (for students)
export const getStudyMaterials = async (courseId: string): Promise<IStudyMaterial[]> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${API_ENDPOINT}/course/${courseId}`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching study materials:', error);
    handleApiError(error);
    return [];
  }
};

// Get a specific study material by ID
export const getStudyMaterial = async (id: string): Promise<IStudyMaterial> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${API_ENDPOINT}/${id}`, { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching study material:', error);
    handleApiError(error);
    throw error;
  }
};

// Admin functions

// Get all study materials for a course (including unpublished) - Admin only
export const getAllStudyMaterials = async (courseId: string): Promise<IStudyMaterial[]> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${ADMIN_API_ENDPOINT}/course/${courseId}/all`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching all study materials:', error);
    handleApiError(error);
    return [];
  }
};

// Create a new study material - Admin only
export const createStudyMaterial = async (studyMaterialData: Partial<IStudyMaterial>): Promise<IStudyMaterial> => {
  try {
    if (!studyMaterialData.courseId) {
      throw new Error('courseId is required');
    }
    
    const headers = await getAuthHeader();
    const courseId = studyMaterialData.courseId;
    const response = await axios.post(`${ADMIN_API_ENDPOINT}/${courseId}`, studyMaterialData, { headers });
    toast.success('Study material created successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error creating study material:', error);
    handleApiError(error);
    throw error;
  }
};

// Update a study material - Admin only
export const updateStudyMaterial = async (id: string, studyMaterialData: Partial<IStudyMaterial>): Promise<IStudyMaterial> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.put(`${ADMIN_API_ENDPOINT}/${id}`, studyMaterialData, { headers });
    toast.success('Study material updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error updating study material:', error);
    handleApiError(error);
    throw error;
  }
};

// Delete a study material - Admin only
export const deleteStudyMaterial = async (id: string): Promise<void> => {
  try {
    const headers = await getAuthHeader();
    await axios.delete(`${ADMIN_API_ENDPOINT}/${id}`, { headers });
    toast.success('Study material deleted successfully');
  } catch (error) {
    console.error('Error deleting study material:', error);
    handleApiError(error);
    throw error;
  }
};

// Reorder study materials - Admin only
export const reorderStudyMaterials = async (courseId: string, materialIds: string[]): Promise<IStudyMaterial[]> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.put(`${ADMIN_API_ENDPOINT}/course/${courseId}/reorder`, { materialIds }, { headers });
    toast.success('Study materials reordered successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error reordering study materials:', error);
    handleApiError(error);
    throw error;
  }
}; 
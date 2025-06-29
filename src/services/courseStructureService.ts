import axios from 'axios';
import { handleApiError } from '@/utils/apiUtils';

// Fallback API URL in case proxy fails
const FALLBACK_API_URL = 'https://a6ef-2405-201-e01b-e0b4-891d-fb29-7e4f-c049.ngrok-free.app';

interface Section {
  id: string;
  title: string;
  content: string;
  generatedContent?: string;
}

interface Subchapter {
  id: string;
  title: string;
  description: string;
  sections: Section[];
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  subchapters: Subchapter[];
}

interface CourseStructure {
  _id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  quizzes?: Quiz[];
}

interface Quiz {
  _id: string;
  question: string;
  options: string[];
  correctOption: number;
}

// Update API URL to use direct fallback URL
const API_URL = `${FALLBACK_API_URL}/api`;

const courseStructureService = {
  // Get course structure
  getCourseStructure: async (courseId: string): Promise<CourseStructure> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`${API_URL}/courses/${courseId}/structure`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check response structure and extract data
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.error('Unexpected API response format:', response.data);
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      throw handleApiError(error, 'Error fetching course structure');
    }
  },

  // Save course structure
  saveCourseStructure: async (courseId: string, structure: CourseStructure): Promise<CourseStructure> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.post(
        `${API_URL}/courses/${courseId}/structure`, 
        structure,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Error saving course structure');
    }
  },

  // Preview AI-generated content
  previewAIContent: async (courseId: string, section: Section): Promise<{ content: string }> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.post(
        `${API_URL}/admin/courses/preview-content`,
        { courseId, sectionTitle: section.title, content: section.content },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Error previewing AI content');
    }
  },

  // Generate course content
  generateCourseContent: async (courseId: string, structure: CourseStructure): Promise<CourseStructure> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.post(
        `${API_URL}/admin/courses/${courseId}/generate-all-content`,
        structure,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Error generating course content');
    }
  },

  // Update course structure
  updateCourseStructure: async (
    courseId: string,
    structure: CourseStructure
  ): Promise<CourseStructure> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.put(
        `${API_URL}/courses/${courseId}/structure`,
        structure,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data;
    } catch (error) {
      throw handleApiError(error, 'Error updating course structure');
    }
  }
};

export default courseStructureService;
export type { CourseStructure, Chapter, Subchapter, Section, Lesson, Quiz }; 
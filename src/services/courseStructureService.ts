import axios from "axios";
import { handleApiError } from "@/utils/apiUtils";
import { getAuthHeader } from "@/utils/authUtils";
import { API_URL } from "../config/api";

interface Section {
  _id: string;
  id?: string;
  title: string;
  content: string;
  generatedContent?: string;
  videoUrl?: string;
}

interface Subchapter {
  _id: string;
  id?: string;
  title: string;
  description: string;
  sections: Section[];
  quiz?: {
    _id: string;
    title: string;
    passingScore?: number;
  };
}

interface Chapter {
  _id: string;
  id?: string;
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

const courseStructureService = {
  // Get course structure
  getCourseStructure: async (
    courseId: string,
  ): Promise<CourseStructure | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(
        `${API_URL}/api/courses/${courseId}/structure`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Check response structure and extract data
      if (response.data && response.data.success && response.data.data) {
        console.log("API Response (getCourseStructure):", response.data.data);
        return response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          "Course structure not found (this is normal for new courses)",
        );
        return null;
      }
      throw handleApiError(error, "Error fetching course structure");
    }
  },

  // Save course structure
  saveCourseStructure: async (
    courseId: string,
    structure: CourseStructure,
  ): Promise<CourseStructure> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.post(
        `${API_URL}/api/courses/${courseId}/structure`,
        structure,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Error saving course structure");
    }
  },

  // Preview AI-generated content
  previewAIContent: async (
    courseId: string,
    section: Section,
  ): Promise<{ content: string }> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.post(
        `${API_URL}/api/admin/courses/preview-content`,
        { courseId, sectionTitle: section.title, content: section.content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Error previewing AI content");
    }
  },

  // Generate course content
  generateCourseContent: async (
    courseId: string,
    structure: CourseStructure,
  ): Promise<CourseStructure> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.post(
        `${API_URL}/api/admin/courses/${courseId}/generate-all-content`,
        structure,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Error generating course content");
    }
  },

  // Update course structure
  updateCourseStructure: async (
    courseId: string,
    structure: CourseStructure,
  ): Promise<CourseStructure> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.put(
        `${API_URL}/api/courses/${courseId}/structure`,
        structure,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw handleApiError(error, "Error updating course structure");
    }
  },

  // Add a new chapter to a course structure
  addChapter: async (courseId: string, chapter: Chapter): Promise<Chapter> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/courses/${courseId}/structure/chapters`,
        chapter,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw handleApiError(error, "Error adding new chapter");
    }
  },

  // Delete a chapter
  deleteChapter: async (courseId: string, chapterId: string): Promise<any> => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/courses/${courseId}/structure/chapters/${chapterId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error, "Failed to delete chapter");
    }
  },
};

export default courseStructureService;
export type { CourseStructure, Chapter, Subchapter, Section, Lesson, Quiz };

import axios from "axios";
import { API_URL } from "../config/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const adminService = {
  // ... existing methods (if any, or this creates the file)

  // Fetch stats for all courses regarding assignments
  getCourseAssignmentStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/assignments/stats`,
        getHeaders(),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fetch all submissions for a specific course
  getCourseSubmissions: async (courseId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/assignments/course/${courseId}`,
        getHeaders(),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Grade an assignment
  gradeAssignment: async (data: {
    courseId: string;
    userId?: string;
    assignmentId: string;
    grade: number;
    feedback: string;
  }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/assignments/grade`,
        data,
        getHeaders(),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default adminService;

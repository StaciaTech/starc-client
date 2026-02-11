import axios from "axios";
import { API_URL } from "../config/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface Question {
  _id: string;
  question: string;
  options: string[];
}

interface EntranceTest {
  testId: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export const assessmentService = {
  getEntranceTest: async (courseId: string): Promise<EntranceTest> => {
    const response = await axios.get(
      `${API_URL}/api/assessments/entrance/${courseId}`,
      { headers: getAuthHeader() },
    );
    return response.data.data;
  },

  submitEntranceTest: async (
    courseId: string,
    answers: Record<string, string>,
  ) => {
    const response = await axios.post(
      `${API_URL}/api/assessments/entrance/${courseId}/submit`,
      { answers },
      { headers: getAuthHeader() },
    );
    return response.data;
  },

  getQualificationStatus: async (
    courseId: string,
  ): Promise<{ qualified: boolean }> => {
    const response = await axios.get(
      `${API_URL}/api/assessments/entrance/${courseId}/status`,
      { headers: getAuthHeader() },
    );
    return response.data.data;
  },
};

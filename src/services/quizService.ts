import api from "../lib/api";
import axios from "axios";
import { getAuthHeader } from "@/utils/authUtils";

// Types and interfaces
export interface IQuizOption {
  optionText: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  _id?: string;
  questionText: string;
  options: IQuizOption[];
  explanation?: string;
  points: number;
}

export interface IQuiz {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage required to pass
  questions: IQuizQuestion[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IQuizAttempt {
  _id: string;
  user: string;
  quiz: string;
  course: string;
  answers: {
    questionIndex: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // in seconds
  startedAt: string;
  completedAt: string;
}

export interface IQuizSubmission {
  answers: {
    questionIndex: number;
    selectedOptionIndex: number;
    questionId?: string;
  }[];
  timeTaken?: number; // in seconds
}

export interface IQuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptId: string;
}

// Get all quizzes for a course
export const getQuizzesByCourse = async (
  courseId: string,
  subchapterId?: string,
): Promise<IQuiz[]> => {
  try {
    const url = subchapterId
      ? `/api/courses/${courseId}/quizzes?subchapterId=${subchapterId}`
      : `/api/courses/${courseId}/quizzes`;
    const response = await api.get(url);
    console.log("API Response (getQuizzesByCourse):", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
};

// Get quiz by ID
export const getQuizById = async (quizId: string): Promise<IQuiz> => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}`);
    console.log("API Response (getQuizById):", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw error;
  }
};

// Create a new quiz
export const createQuiz = async (
  courseId: string,
  quizData: Partial<IQuiz>,
): Promise<IQuiz> => {
  try {
    const response = await api.post(
      `/api/courses/${courseId}/quizzes`,
      quizData,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

// Update a quiz
export const updateQuiz = async (
  quizId: string,
  quizData: Partial<IQuiz>,
): Promise<IQuiz> => {
  try {
    const response = await api.put(`/api/quizzes/${quizId}`, quizData);
    return response.data.data;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

// Delete a quiz
export const deleteQuiz = async (quizId: string): Promise<void> => {
  try {
    await api.delete(`/api/quizzes/${quizId}`);
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};

// Submit a quiz attempt
export const submitQuizAttempt = async (
  quizId: string,
  submission: IQuizSubmission,
): Promise<IQuizResult> => {
  try {
    const response = await api.post(
      `/api/quizzes/${quizId}/submit`,
      submission,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    throw error;
  }
};

// Get user's quiz attempts for a course
export const getUserQuizAttemptsByCourse = async (
  courseId: string,
): Promise<IQuizAttempt[]> => {
  try {
    const response = await api.get(`/api/courses/${courseId}/quiz-attempts`);
    console.log(
      "API Response (getUserQuizAttemptsByCourse):",
      response.data.data,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    throw error;
  }
};

// Get quiz attempt by ID
export const getQuizAttemptById = async (
  attemptId: string,
): Promise<IQuizAttempt> => {
  try {
    const response = await api.get(`/api/quiz-attempts/${attemptId}`);
    console.log("API Response (getQuizAttemptById):", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching quiz attempt:", error);
    throw error;
  }
};

// Get published quizzes for a course (for students)
export const getPublishedQuizzesByCourse = async (
  courseId: string,
): Promise<IQuiz[]> => {
  try {
    console.log("Fetching published quizzes for course:", courseId);
    // First, get all quizzes for the course
    const response = await api.get(`/api/courses/${courseId}/quizzes`);
    const quizzes = response.data.data || [];
    console.log("Backend returned quizzes:", quizzes);

    // Filter to only return published quizzes
    const publishedQuizzes = quizzes.filter((quiz) => quiz.isPublished);
    console.log("Filtered published quizzes:", publishedQuizzes);

    return publishedQuizzes;
  } catch (error) {
    console.error("Error fetching published quizzes by course:", error);
    throw error;
  }
};

// Get quiz attempts for a specific quiz
export const getQuizAttemptsByQuiz = async (
  quizId: string,
): Promise<IQuizAttempt[]> => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}/attempts`);
    console.log("API Response (getQuizAttemptsByQuiz):", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    throw error;
  }
};

// Add the getUserQuizAttempts function to the service

/**
 * Get all quiz attempts for the current user in a specific course
 * @param courseId The ID of the course
 * @returns Promise containing the quiz attempts
 */
const getUserQuizAttempts = async (courseId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/quizzes/attempts/course/${courseId}`);
    console.log("API Response (getUserQuizAttempts):", response.data.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching user quiz attempts:", error);
    return [];
  }
};

// Get quiz for a specific subchapter
export const getQuizBySubchapter = async (
  courseId: string,
  subchapterId: string,
): Promise<IQuiz> => {
  try {
    console.log(
      `Calling API: /api/courses/${courseId}/subchapters/${subchapterId}/quiz`,
    );
    const response = await api.get(
      `/api/courses/${courseId}/subchapters/${subchapterId}/quiz`,
    );
    console.log(`API Response (getQuizBySubchapter):`, response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching subchapter quiz:", error);
    throw error;
  }
};

// Default export
const quizService = {
  getQuizzesByCourse,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getUserQuizAttemptsByCourse,
  getQuizAttemptById,
  getPublishedQuizzesByCourse,
  getQuizAttemptsByQuiz,
  getUserQuizAttempts,
  getQuizBySubchapter,
};

export default quizService;

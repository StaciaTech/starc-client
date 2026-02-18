import axios from "axios";
import { API_URL } from "../config/api";

export interface CapstoneProject {
  _id: string;
  courseId: string;
  variantNumber: number;
  title: string;
  description: string;
  technicalRequirements: string[];
  submissionGuidelines: string;
  createdAt: string;
  updatedAt: string;
}

// Get all capstone projects for a course
export const getCapstoneProjects = async (
  courseId: string,
): Promise<CapstoneProject[]> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/api/courses/${courseId}/capstone-projects`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data.data;
};

// Create a new capstone project
export const createCapstoneProject = async (
  courseId: string,
  projectData: Partial<CapstoneProject>,
): Promise<CapstoneProject> => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/api/courses/${courseId}/capstone-projects`,
    projectData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data.data;
};

// Update a capstone project
export const updateCapstoneProject = async (
  id: string,
  projectData: Partial<CapstoneProject>,
): Promise<CapstoneProject> => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_URL}/api/capstone-projects/${id}`,
    projectData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data.data;
};

// Delete a capstone project
export const deleteCapstoneProject = async (id: string): Promise<void> => {
  const token = localStorage.getItem("token");
  await axios.delete(`${API_URL}/api/capstone-projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

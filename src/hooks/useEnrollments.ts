import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config/api";

// Get pending enrollments (locked courses)
export const useEnrollments = () => {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await axios.get(`${API_URL}/api/enrollments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!localStorage.getItem("token"),
  });
};

// Get all enrollments (including completed)
export const useAllEnrollments = () => {
  return useQuery({
    queryKey: ["enrollments", "all"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await axios.get(`${API_URL}/api/enrollments/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!localStorage.getItem("token"),
  });
};

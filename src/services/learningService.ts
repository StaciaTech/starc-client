import axios from "axios";
import { API_URL } from "@/config/api";

/**
 * Frontend service for requesting signed URLs from backend
 *
 * Security: NO AWS credentials are stored in frontend
 * All signing happens server-side with proper authentication
 */

interface SignedUrlResponse {
  success: boolean;
  signedUrl?: string;
  expiresIn?: number;
  expiresAt?: string;
  message?: string;
}

interface BatchSignedUrlResponse {
  success: boolean;
  urls?: Array<{
    originalKey: string;
    signedUrl: string | null;
    success: boolean;
    error?: string;
  }>;
  expiresIn?: number;
  expiresAt?: string;
  message?: string;
}

/**
 * Get a signed URL for a single S3 file
 * @param s3Key - S3 file key or full S3 URL
 * @returns Temporary signed URL valid for 10 minutes
 */
export const getSignedUrl = async (s3Key: string): Promise<string> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await axios.get<SignedUrlResponse>(
      `${API_URL}/api/learning/signed-url`,
      {
        params: { key: s3Key },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.data.success || !response.data.signedUrl) {
      throw new Error(response.data.message || "Failed to get signed URL");
    }

    return response.data.signedUrl;
  } catch (error: any) {
    console.error("Error fetching signed URL:", error);
    throw new Error(error.response?.data?.message || "Failed to access file");
  }
};

/**
 * Get signed URLs for multiple S3 files in batch
 * Useful for preloading videos/PDFs in a chapter
 *
 * @param s3Keys - Array of S3 file keys or full URLs
 * @returns Map of original keys to signed URLs
 */
export const getSignedUrlsBatch = async (
  s3Keys: string[],
): Promise<Map<string, string>> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await axios.post<BatchSignedUrlResponse>(
      `${API_URL}/api/learning/signed-urls`,
      { keys: s3Keys },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.data.success || !response.data.urls) {
      throw new Error(response.data.message || "Failed to get signed URLs");
    }

    // Convert to Map for easy lookup
    const urlMap = new Map<string, string>();
    response.data.urls.forEach((item) => {
      if (item.success && item.signedUrl) {
        urlMap.set(item.originalKey, item.signedUrl);
      }
    });

    return urlMap;
  } catch (error: any) {
    console.error("Error fetching signed URLs:", error);
    throw new Error(error.response?.data?.message || "Failed to access files");
  }
};

/**
 * Check if a signed URL is likely expired
 * Signed URLs expire after 10 minutes
 *
 * @param timestamp - When the URL was generated
 * @returns true if likely expired (after 9 minutes)
 */
export const isSignedUrlExpired = (timestamp: number): boolean => {
  const NINE_MINUTES = 9 * 60 * 1000;
  return Date.now() - timestamp > NINE_MINUTES;
};

/**
 * Delete a file from S3 via backend
 * @param fileUrl - S3 file URL or key to delete
 */
export const deleteS3File = async (fileUrl: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");

    const response = await axios.delete(`${API_URL}/api/learning/delete-s3`, {
      params: { key: fileUrl },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.success;
  } catch (error: any) {
    console.error("Error deleting S3 file:", error);
    throw new Error(error.response?.data?.message || "Failed to delete file");
  }
};

export default {
  getSignedUrl,
  getSignedUrlsBatch,
  isSignedUrlExpired,
  deleteS3File,

  getAssignments: async (courseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/learning/assignments/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
      throw error.response?.data || error;
    }
  },

  submitAssignment: async (
    courseId: string,
    chapterId: string,
    submissionLink: string,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/learning/assignments/${courseId}/${chapterId}/submit`,
        { submissionLink },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error submitting assignment:", error);
      throw error.response?.data || error;
    }
  },
};

import axios from "axios";
import { handleApiError } from "@/utils/apiUtils";
import { AUTH_STATE_CHANGED_EVENT } from "@/App";
import { API_URL } from "@/config/api";

// Fallback API URL in case proxy fails
// const FALLBACK_API_URL = 'https://server.edifai.in';

// Update API URL to use direct fallback URL
const AUTH_API_URL = `${API_URL}/api/auth`;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  try {
    console.log("Attempting login with: ", credentials);
    const response = await axios.post(AUTH_API_URL + "/login", credentials);
    console.log("Login response:", response.data);
    console.log(
      "Login response structure:",
      JSON.stringify(response.data, null, 2),
    );

    // Check if response has the expected structure
    // The response might have data directly or nested in a data property
    const responseData = response.data.data || response.data;

    console.log("Extracted responseData:", responseData);
    console.log("Has token:", !!responseData?.token);
    console.log("Has user:", !!responseData?.user);

    if (!responseData || !responseData.token || !responseData.user) {
      console.error("Invalid response structure:", response.data);
      throw new Error("Invalid response structure from server");
    }

    // Store token in localStorage
    localStorage.setItem("token", responseData.token);
    localStorage.setItem("user", JSON.stringify(responseData.user));

    // Dispatch auth state changed event
    window.dispatchEvent(
      new CustomEvent(AUTH_STATE_CHANGED_EVENT, {
        detail: {
          isAuthenticated: true,
          user: responseData.user,
        },
      }),
    );

    return responseData;
  } catch (error) {
    console.log("Login error:", error);
    throw handleApiError(error, "Login failed");
  }
};

export const register = async (
  userData: RegisterData,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(AUTH_API_URL + "/register", userData);
    console.log("Register response:", response.data);

    // Check if response has the expected structure
    // The response might have data directly or nested in a data property
    const responseData = response.data.data || response.data;

    if (!responseData || !responseData.token || !responseData.user) {
      console.error("Invalid response structure:", response.data);
      throw new Error("Invalid response structure from server");
    }

    // Store token in localStorage
    localStorage.setItem("token", responseData.token);
    localStorage.setItem("user", JSON.stringify(responseData.user));

    // Dispatch auth state changed event
    window.dispatchEvent(
      new CustomEvent(AUTH_STATE_CHANGED_EVENT, {
        detail: {
          isAuthenticated: true,
          user: responseData.user,
        },
      }),
    );

    return responseData;
  } catch (error) {
    throw handleApiError(error, "Registration failed");
  }
};

export const forgotPassword = async (
  email: string,
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(AUTH_API_URL + "/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to send password reset verification code");
  }
};

export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<{ message: string; data?: any }> => {
  try {
    const response = await axios.post(AUTH_API_URL + "/verify-otp", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to verify verification code");
  }
};

export interface ResetPasswordData {
  email: string;
  otp: string;
  password: string;
}

export const resetPassword = async (
  data: ResetPasswordData,
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(AUTH_API_URL + "/reset-password", data);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to reset password");
  }
};

export const verifyToken = async (token: string): Promise<boolean> => {
  // TEMPORARY FIX: Always return true to prevent logout issues
  // TODO: Re-enable server-side validation once the root cause is identified
  return true;
  /*
  try {
    await axios.get(AUTH_API_URL + "/validate-token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error: any) {
    console.error("Token verification error:", error);
    // Only return false if explicitly unauthorized (401) or forbidden (403)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      return false;
    }
    // For network errors or 500s, assume token is still valid to prevent auto-logout
    // user will experience API errors on other calls instead
    return true;
  }
  */
};

export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Dispatch auth state changed event
  window.dispatchEvent(
    new CustomEvent(AUTH_STATE_CHANGED_EVENT, {
      detail: {
        isAuthenticated: false,
        user: null,
      },
    }),
  );
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

/**
 * Get current user data from the server
 * @returns Current user data or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(`${AUTH_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getting current user:", error);

    // Try to get user from localStorage as fallback
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        return { success: true, data: userData };
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }

    throw error;
  }
};

export default {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyToken,
  logout,
  isAuthenticated,
  getCurrentUser,
};

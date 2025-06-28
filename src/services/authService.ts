import axios from 'axios';
import { handleApiError } from '@/utils/apiUtils';

// Fallback API URL in case proxy fails
const FALLBACK_API_URL = 'https://3644-2405-201-e01b-e0b4-6946-b90-4182-ee94.ngrok-free.app';

// Update API URL to use direct fallback URL
const AUTH_API_URL = `${FALLBACK_API_URL}/api/auth`;

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

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log("Attempting login with: ", credentials);
    const response = await axios.post(AUTH_API_URL + '/login', credentials);
    console.log("Login response:", response.data);
    console.log("Login response structure:", JSON.stringify(response.data, null, 2));
    
    // Check if response has the expected structure
    // The response might have data directly or nested in a data property
    const responseData = response.data.data || response.data;
    
    console.log("Extracted responseData:", responseData);
    console.log("Has token:", !!responseData?.token);
    console.log("Has user:", !!responseData?.user);
    
    if (!responseData || !responseData.token || !responseData.user) {
      console.error("Invalid response structure:", response.data);
      throw new Error('Invalid response structure from server');
    }
    
    // Store token in localStorage
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('user', JSON.stringify(responseData.user));
    
    return responseData;
  } catch (error) {
    console.log("Login error:", error);
    throw handleApiError(error, 'Login failed');
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(AUTH_API_URL + '/register', userData);
    console.log("Register response:", response.data);
    
    // Check if response has the expected structure
    // The response might have data directly or nested in a data property
    const responseData = response.data.data || response.data;
    
    if (!responseData || !responseData.token || !responseData.user) {
      console.error("Invalid response structure:", response.data);
      throw new Error('Invalid response structure from server');
    }
    
    // Store token in localStorage
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('user', JSON.stringify(responseData.user));
    
    return responseData;
  } catch (error) {
    throw handleApiError(error, 'Registration failed');
  }
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(AUTH_API_URL + '/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to send password reset email');
  }
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(AUTH_API_URL + '/reset-password', { token, password });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to reset password');
  }
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    await axios.get(AUTH_API_URL + '/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyToken,
  logout,
  isAuthenticated
}; 
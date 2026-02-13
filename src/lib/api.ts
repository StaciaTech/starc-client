import axios from "axios";
import { API_URL } from "../config/api";

// Create a centralized API instance with authentication
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include the auth token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.data || "",
      );
      // Ensure headers are logged visibly
      const headersToCheck = (config.headers as any).toJSON
        ? (config.headers as any).toJSON()
        : config.headers;
      console.log(`Request headers:`, JSON.stringify(headersToCheck, null, 2));
      console.log(`Auth Token Present: ${!!token}`);
    }

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `API Response: ${response.status} ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },
  (error) => {
    // Don't log errors in production to avoid console spam
    if (process.env.NODE_ENV !== "production") {
      console.error("API Response Error:", error.message);

      // Check for CORS errors
      if (error.message === "Network Error") {
        console.error(
          "Possible CORS issue. Check that the backend server is running and CORS is configured correctly.",
        );
        console.error("Frontend origin:", window.location.origin);
        console.error("Backend URL:", API_URL);
      }

      if (error.response) {
        console.error(`Status: ${error.response.status}`, error.response.data);
      }
    }

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // If we're not on the login page, redirect to login
      if (!window.location.pathname.includes("LoginPage")) {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token");
        window.location.href = "/LoginPage";
      }
    }
    return Promise.reject(error);
  },
);

export default api;

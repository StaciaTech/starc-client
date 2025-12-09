import axios from "axios";
import { API_URL } from "@/config/api";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Create axios instance with auth headers
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface CartItem {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    instructor: string;
    price: number;
    discount: number;
    discountedPrice: number;
    rating: number;
    level: string;
    duration: number;
  };
  addedAt: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    summary: CartSummary;
  };
}

const cartService = {
  // Get user's cart with full details
  getCart: async (): Promise<CartResponse> => {
    const response = await axiosInstance.get("/cart");
    return response.data;
  },

  // Get cart item count
  getCartCount: async (): Promise<number> => {
    const response = await axiosInstance.get("/cart/count");
    return response.data.count;
  },

  // Add course to cart
  addToCart: async (courseId: string) => {
    const response = await axiosInstance.post("/cart/add", { courseId });
    return response.data;
  },

  // Remove course from cart
  removeFromCart: async (courseId: string) => {
    const response = await axiosInstance.delete(`/cart/remove/${courseId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await axiosInstance.delete("/cart/clear");
    return response.data;
  },
};

export default cartService;

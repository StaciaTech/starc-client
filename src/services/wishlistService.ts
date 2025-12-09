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

export interface WishlistItem {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    description: string;
    instructor: string;
    price: number;
    discount: number;
    discountedPrice: number;
    rating: number;
    level: string;
    duration: number;
    category: string;
  };
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistItem[];
    itemCount: number;
  };
}

const wishlistService = {
  // Get user's wishlist with full details
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await axiosInstance.get("/wishlist");
    return response.data;
  },

  // Get wishlist item count
  getWishlistCount: async (): Promise<number> => {
    const response = await axiosInstance.get("/wishlist/count");
    return response.data.count;
  },

  // Add course to wishlist
  addToWishlist: async (courseId: string) => {
    const response = await axiosInstance.post("/wishlist/add", { courseId });
    return response.data;
  },

  // Remove course from wishlist
  removeFromWishlist: async (courseId: string) => {
    const response = await axiosInstance.delete(`/wishlist/remove/${courseId}`);
    return response.data;
  },

  // Move course from wishlist to cart
  moveToCart: async (courseId: string) => {
    const response = await axiosInstance.post(
      `/wishlist/move-to-cart/${courseId}`
    );
    return response.data;
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    const response = await axiosInstance.delete("/wishlist/clear");
    return response.data;
  },
};

export default wishlistService;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

// ✅ API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log(API_BASE_URL);

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ✅ TypeScript Interfaces
export interface CartItem {
  course: {
    _id: string;
    title: string;
    description: string;
    price: number;
    discountedPrice: number;
    discount: number;
    thumbnail: string;
    level: string;
    duration: string;
    rating?: number;
  };
  addedAt: string;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    summary: {
      itemCount: number;
      totalPrice: number;
      totalDiscount: number;
      finalPrice: number;
    };
  };
}

// ✅ Query Keys
export const cartKeys = {
  all: ["cart"] as const,
  details: () => [...cartKeys.all, "details"] as const,
  count: () => [...cartKeys.all, "count"] as const,
};

// ====================================
// 🔹 HOOKS WITH DIRECT API CALLS
// ====================================

// ✅ Get full cart with all course details
export const useCart = () => {
  return useQuery<CartResponse>({
    queryKey: cartKeys.details(),
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: getAuthHeaders(),
      });
      console.log(data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

// ✅ Get cart item count (for navbar badge)
export const useCartCount = () => {
  return useQuery<number>({
    queryKey: cartKeys.count(),
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/cart/count`, {
        headers: getAuthHeaders(),
      });
      return data.count || 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    placeholderData: 0, // Show 0 while loading
  });
};

// ✅ Add course to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        { courseId },
        { headers: getAuthHeaders() }
      );
      return data;
    },

    // Optimistic update
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });

      const previousCount = queryClient.getQueryData<number>(cartKeys.count());

      if (previousCount !== undefined) {
        queryClient.setQueryData<number>(cartKeys.count(), previousCount + 1);
      }

      return { previousCount };
    },

    // Rollback on error
    onError: (error: any, courseId, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData<number>(
          cartKeys.count(),
          context.previousCount
        );
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add to cart";
      toast.error(errorMessage);
    },

    // Success
    onSuccess: (data) => {
      toast.success(data.message || "Course added to cart!");
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// ✅ Remove course from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await axios.delete(
        `${API_BASE_URL}/api/cart/remove/${courseId}`,
        { headers: getAuthHeaders() }
      );
      return data;
    },

    // Optimistic update
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });

      const previousCart = queryClient.getQueryData<CartResponse>(
        cartKeys.details()
      );
      const previousCount = queryClient.getQueryData<number>(cartKeys.count());

      // Remove from cart
      if (previousCart) {
        queryClient.setQueryData<CartResponse>(cartKeys.details(), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: previousCart.data.items.filter(
              (item) => item.course._id !== courseId
            ),
            summary: {
              ...previousCart.data.summary,
              itemCount: previousCart.data.summary.itemCount - 1,
            },
          },
        });
      }

      // Update count
      if (previousCount !== undefined) {
        queryClient.setQueryData<number>(
          cartKeys.count(),
          Math.max(0, previousCount - 1)
        );
      }

      return { previousCart, previousCount };
    },

    // Rollback on error
    onError: (error: any, courseId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData<CartResponse>(
          cartKeys.details(),
          context.previousCart
        );
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData<number>(
          cartKeys.count(),
          context.previousCount
        );
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to remove from cart";
      toast.error(errorMessage);
    },

    // Success
    onSuccess: (data) => {
      toast.success("Course removed from cart");
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// ✅ Clear entire cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(`${API_BASE_URL}/api/cart/clear`, {
        headers: getAuthHeaders(),
      });
      return data;
    },

    onSuccess: () => {
      toast.success("Cart cleared successfully");
      queryClient.setQueryData<number>(cartKeys.count(), 0);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },

    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to clear cart";
      toast.error(errorMessage);
    },
  });
};

// ✅ Prefetch cart data
export const usePrefetchCart = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: cartKeys.details(),
      queryFn: async () => {
        const { data } = await axios.get(`${API_BASE_URL}/api/cart`, {
          headers: getAuthHeaders(),
        });
        return data;
      },
      staleTime: 1000 * 60 * 5,
    });
  };
};

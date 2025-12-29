import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import wishlistService, { WishlistResponse } from "@/services/wishlistService";
import { toast } from "sonner";
import { cartKeys } from "./useCart";

// ✅ Query Keys for Wishlist
export const wishlistKeys = {
  all: ["wishlist"] as const,
  details: () => [...wishlistKeys.all, "details"] as const,
  count: () => [...wishlistKeys.all, "count"] as const,
};

// ✅ Get full wishlist with all course details
export const useWishlist = () => {
  return useQuery<WishlistResponse>({
    queryKey: wishlistKeys.details(),
    queryFn: wishlistService.getWishlist,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

// ✅ Get wishlist item count (for navbar badge)
export const useWishlistCount = () => {
  return useQuery<number>({
    queryKey: wishlistKeys.count(),
    queryFn: wishlistService.getWishlistCount,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    placeholderData: 0, // Show 0 while loading
  });
};

// ✅ Add course to wishlist mutation
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => wishlistService.addToWishlist(courseId),

    // Optimistic update before API call
    onMutate: async (courseId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });

      // Snapshot the previous count
      const previousCount = queryClient.getQueryData<number>(
        wishlistKeys.count()
      );

      // Optimistically update count
      if (previousCount !== undefined) {
        queryClient.setQueryData<number>(
          wishlistKeys.count(),
          previousCount + 1
        );
      }

      return { previousCount };
    },

    // Rollback on error
    onError: (error: any, courseId, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData<number>(
          wishlistKeys.count(),
          context.previousCount
        );
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add to wishlist";
      toast.error(errorMessage);
    },

    // Success handler
    onSuccess: (data) => {
      toast.success(data.message || "Course added to wishlist!");

      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
};

// ✅ Remove course from wishlist mutation
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      wishlistService.removeFromWishlist(courseId),

    // Optimistic update
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });

      // Snapshot previous data
      const previousWishlist = queryClient.getQueryData<WishlistResponse>(
        wishlistKeys.details()
      );
      const previousCount = queryClient.getQueryData<number>(
        wishlistKeys.count()
      );

      // Optimistically remove the course
      if (previousWishlist) {
        queryClient.setQueryData<WishlistResponse>(wishlistKeys.details(), {
          ...previousWishlist,
          data: {
            items: previousWishlist.data.items.filter(
              (item) => item.course._id !== courseId
            ),
            itemCount: previousWishlist.data.itemCount - 1,
          },
        });
      }

      // Update count
      if (previousCount !== undefined) {
        queryClient.setQueryData<number>(
          wishlistKeys.count(),
          Math.max(0, previousCount - 1)
        );
      }

      return { previousWishlist, previousCount };
    },

    // Rollback on error
    onError: (error: any, courseId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData<WishlistResponse>(
          wishlistKeys.details(),
          context.previousWishlist
        );
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData<number>(
          wishlistKeys.count(),
          context.previousCount
        );
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to remove from wishlist";
      toast.error(errorMessage);
    },

    // Success handler
    onSuccess: () => {
      toast.success("Course removed from wishlist");
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
};

// ✅ Move course from wishlist to cart mutation
export const useMoveToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => wishlistService.moveToCart(courseId),

    // Optimistic update
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });
      await queryClient.cancelQueries({ queryKey: cartKeys.all });

      const previousWishlist = queryClient.getQueryData<WishlistResponse>(
        wishlistKeys.details()
      );
      const previousWishlistCount = queryClient.getQueryData<number>(
        wishlistKeys.count()
      );
      const previousCartCount = queryClient.getQueryData<number>(
        cartKeys.count()
      );

      // Optimistically update counts
      if (previousWishlistCount !== undefined) {
        queryClient.setQueryData<number>(
          wishlistKeys.count(),
          Math.max(0, previousWishlistCount - 1)
        );
      }

      if (previousCartCount !== undefined) {
        queryClient.setQueryData<number>(
          cartKeys.count(),
          previousCartCount + 1
        );
      }

      return { previousWishlist, previousWishlistCount, previousCartCount };
    },

    // Rollback on error
    onError: (error: any, courseId, context) => {
      if (context?.previousWishlistCount !== undefined) {
        queryClient.setQueryData<number>(
          wishlistKeys.count(),
          context.previousWishlistCount
        );
      }
      if (context?.previousCartCount !== undefined) {
        queryClient.setQueryData<number>(
          cartKeys.count(),
          context.previousCartCount
        );
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to move to cart";
      toast.error(errorMessage);
    },

    // Success handler
    onSuccess: () => {
      toast.success("Course moved to cart!");

      // Invalidate both cart and wishlist
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
};

// ✅ Clear entire wishlist mutation
export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.clearWishlist,

    onSuccess: () => {
      toast.success("Wishlist cleared successfully");

      // Immediately update cache
      queryClient.setQueryData<number>(wishlistKeys.count(), 0);
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },

    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to clear wishlist";
      toast.error(errorMessage);
    },
  });
};

// ✅ Prefetch wishlist data (useful for optimizing navigation)
export const usePrefetchWishlist = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: wishlistKeys.details(),
      queryFn: wishlistService.getWishlist,
      staleTime: 1000 * 60 * 5,
    });
  };
};

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
export type BookGenerationStatus =
  | "pending"
  | "generating"
  | "completed"
  | "failed";

export interface CourseForBookGeneration {
  _id: string;
  title: string;
  topic: string;
  skillLevel: string;
  creator: string;
  chapters: number;
  bookId: string | null;
  bookGenerated: boolean;
}

export interface CoursesForBookResponse {
  success: boolean;
  data: CourseForBookGeneration[];
}

export interface GenerateBookResponse {
  success: boolean;
  message: string;
  bookId: string;
  estimatedTime?: string;
}

export interface BookStatusChapter {
  title: string;
  status: BookGenerationStatus;
  error?: string;
}

export interface BookStatusResponse {
  success: boolean;
  data: {
    bookId: string;
    status: BookGenerationStatus;
    progress: {
      completedChapters: number;
      totalChapters: number;
      percentage: number;
    };
    chapterStatuses: BookStatusChapter[];
    startedAt?: string;
    completedAt?: string;
    error?: string;
  };
}

export interface BookSummaryChapter {
  _id: string;
  title: string;
  order: number;
  summary: string;
  wordCount: number;
  sectionCount: number;
  status: BookGenerationStatus;
}

export interface BookResponse {
  success: boolean;
  data: {
    _id: string;
    title: string;
    courseTitle: string;
    courseCreatorId?: string;
    description: string;
    skillLevel: string;
    totalWordCount: number;
    totalChapters: number;
    chapters: BookSummaryChapter[];
  };
}

export interface BookSection {
  _id: string;
  title: string;
  order: number;
  content: string;
  wordCount: number;
}

export interface BookChapterResponse {
  success: boolean;
  data: {
    _id: string;
    title: string;
    order: number;
    summary: string;
    sections: BookSection[];
    totalWordCount: number;
  };
}

// ✅ Query Keys
export const bookKeys = {
  all: ["books"] as const,
  courses: () => [...bookKeys.all, "courses"] as const,
  status: (bookId: string) => [...bookKeys.all, "status", bookId] as const,
  details: (bookId: string) => [...bookKeys.all, "details", bookId] as const,
  chapter: (bookId: string, chapterId: string) =>
    [...bookKeys.all, "chapter", bookId, chapterId] as const,
};

// ====================================
// 🔹 HOOKS WITH DIRECT API CALLS
// ====================================

// ✅ Get all courses for book generation (Admin)
export const useBookCourses = () => {
  return useQuery<CoursesForBookResponse>({
    queryKey: bookKeys.courses(),
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/books/courses`, {
        headers: getAuthHeaders(),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// ✅ Generate book (Admin)
export const useGenerateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/books/generate/${courseId}`,
        {},
        { headers: getAuthHeaders() }
      );
      return data as GenerateBookResponse;
    },

    onSuccess: (data) => {
      toast.success(data.message || "Book generation started");
      queryClient.invalidateQueries({ queryKey: bookKeys.courses() });

      if (data.bookId) {
        queryClient.invalidateQueries({
          queryKey: bookKeys.status(data.bookId),
        });
      }
    },

    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate book";
      toast.error(errorMessage);
    },
  });
};

// ✅ Get book generation status
export const useBookStatus = (
  bookId?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) => {
  return useQuery<BookStatusResponse>({
    queryKey: bookKeys.status(bookId || ""),
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/books/${bookId}/status`,
        {
          headers: getAuthHeaders(),
        }
      );
      return data;
    },
    enabled: !!bookId && (options?.enabled ?? true),
    staleTime: 0,
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "pending" || status === "generating") {
        return options?.refetchInterval ?? 5000;
      }
      return false;
    },
  });
};

// ✅ Get full book details
export const useBook = (bookId?: string, enabled = true) => {
  return useQuery<BookResponse>({
    queryKey: bookKeys.details(bookId || ""),
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/books/${bookId}`, {
        headers: getAuthHeaders(),
      });
      return data;
    },
    enabled: !!bookId && enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// ✅ Get single chapter content
export const useBookChapter = (
  bookId?: string,
  chapterId?: string,
  enabled = true
) => {
  return useQuery<BookChapterResponse>({
    queryKey: bookKeys.chapter(bookId || "", chapterId || ""),
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/books/${bookId}/chapter/${chapterId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return data;
    },
    enabled: !!bookId && !!chapterId && enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// ✅ Prefetch book
export const usePrefetchBook = () => {
  const queryClient = useQueryClient();

  return (bookId: string) => {
    queryClient.prefetchQuery({
      queryKey: bookKeys.details(bookId),
      queryFn: async () => {
        const { data } = await axios.get(`${API_BASE_URL}/api/books/${bookId}`, {
          headers: getAuthHeaders(),
        });
        return data;
      },
      staleTime: 1000 * 60 * 5,
    });
  };
};

// ✅ Prefetch chapter
export const usePrefetchBookChapter = () => {
  const queryClient = useQueryClient();

  return (bookId: string, chapterId: string) => {
    queryClient.prefetchQuery({
      queryKey: bookKeys.chapter(bookId, chapterId),
      queryFn: async () => {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/books/${bookId}/chapter/${chapterId}`,
          {
            headers: getAuthHeaders(),
          }
        );
        return data;
      },
      staleTime: 1000 * 60 * 5,
    });
  };
};

// ✅ Get book info by courseId — used by ChapterView's BookSection
export const useBookByCourse = (courseId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["books", "by-course", courseId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/books/by-course/${courseId}`,
        { headers: getAuthHeaders() }
      );
      return data as {
        success: boolean;
        bookId: string | null;
        bookGenerated: boolean;
        status: string;
        progress: { completedChapters: number; totalChapters: number; percentage: number } | null;
        data: any;
      };
    },
    enabled: !!courseId && enabled,
    staleTime: 0,
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Keep polling while book is being generated
      if (status === "pending" || status === "generating") return 5000;
      return false;
    },
  });
};


interface CourseStat {
  courseId: string;
  quizCredits: number;
  questionCredits: number;
  xp: number;
  level: number;
  completedChapterIds: string[];
  lastAccessedAt: string | null;
}

interface ULearnUserStats {
  _id: string;
  userId: string;
  streak: number;
  lastActiveDate: string | null;
  courses: CourseStat[];
}

// ── fetch helper — consistent with rest of the file ──
const fetchUserStats = async (): Promise<ULearnUserStats> => {
  const { data } = await axios.get(`${API_BASE_URL}/api/ulearn/stats`, {
    headers: getAuthHeaders(),   // ✅ auth token
  });
  console.log(data.data);

  return data.data;
};

// ── All stats (all courses) ──────────────────────────
export const useULearnStats = () => {
  return useQuery({
    queryKey: ["ulearn-stats"],
    queryFn: fetchUserStats,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

// ── Stats for a specific course ──────────────────────
export const useCourseStats = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["ulearn-stats", courseId],
    queryFn: async () => {
      const stats = await fetchUserStats();
      if (!stats || !stats.courses) return null;
      // courseId from DB is ObjectId string — do toString() safe compare
      return stats.courses.find(
        (c) => c.courseId.toString() === courseId?.toString()
      ) ?? null;
    },
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

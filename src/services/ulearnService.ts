import axios from "axios";
import { getAuthHeader } from "@/utils/authUtils";
import { API_URL } from "@/config/api";

const BASE = `${API_URL}/api/ulearn`;

// ── Types ────────────────────────────────────────────────────────
export interface DiagnosticQuestion {
  id: string;
  question: string;
  type: "mcq" | "open";
  options?: string[];
  correctOptionIndex?: number;
  probes: string;
}

export interface DiagnosticAnswer {
  question: string;
  answer: string;
}

export interface ULearnChapter {
  _id: string;
  title: string;
  summary: string;
  content: string;
  order: number;
  xpReward: number;
  isUnlocked: boolean;
  contentGenerated: boolean;
}

export interface ULearnModule {
  _id: string;
  title: string;
  order: number;
  chapters: ULearnChapter[];
}

export interface ULearnCourse {
  _id: string;
  userId: string;
  topic: string;
  title: string;
  description: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "mixed";
  estimatedHours: number;
  price: number;
  includedQuizCredits: number;
  includedQuestionTokens: number;
  quizCredits: number;
  questionCredits: number;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  modules: ULearnModule[];
  generationStatus: "pending" | "generating_structure" | "payment_pending" | "generating_content" | "completed" | "failed";
  completedChapterIds: string[];
  currentChapterId: string | null;
  createdAt: string;
}

export interface ULearnStats {
  xp: number;
  level: number;
  streak: number;
  quizCredits: number;
  questionCredits: number;
  courseCount: number;
  lastActiveDate: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface ChatEntry {
  question: string;
  answer: string;
  createdAt: string;
}

export interface ChatHistory {
  _id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  chapterTitle: string;
  chats: ChatEntry[];
}

// ── API Functions ─────────────────────────────────────────────────

export const getDiagnosticTest = async (topic: string) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE}/diagnostic`, { topic }, { headers });
  return res.data.diagnostic as { topic: string; estimatedLevel: string; questions: DiagnosticQuestion[] };
};

export const generateCourse = async (data: {
  topic: string;
  diagnosticAnswers: DiagnosticAnswer[];
  skillLevel: string;
}) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE}/generate-course`, data, { headers });
  return res.data as { success: boolean; courseId: string; estimatedTime: string };
};

export const getCourse = async (courseId: string) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE}/course/${courseId}`, { headers });
  return res.data.course as ULearnCourse;
};

export const getMyCourses = async () => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE}/my-courses`, { headers });
  return res.data.courses as ULearnCourse[];
};

export const getOrGenerateQuiz = async (data: {
  courseId: string;
  chapterId: string;
  courseTitle: string;
  chapterTitle: string;
  chapterContent: string;
}) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE}/quiz`, data, { headers, timeout: 30000 });
  return res.data as { quiz: { questions: QuizQuestion[] }; fromCache: boolean; creditsRemaining: number };
};

export const getOrGeneratePodcast = async (data: {
  chapterId: string;
  chapterTitle: string;
  chapterContent: string;
}) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE}/podcast`, data, { headers, timeout: 120000 });
  return res.data as { audioBase64: string; fromCache: boolean };
};

export const completeChapter = async (data: {
  courseId: string;
  chapterId: string;
  xpReward: number;
  moduleIdx: number;
  chapterIdx: number;
}) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE}/complete-chapter`, data, { headers });
  return res.data as { xpEarned: number; totalXp: number; level: number; leveledUp: boolean; streak: number };
};

export const payForCourse = async (courseId: string) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE}/course/${courseId}/pay`, {}, { headers });
  return res.data;
};

// Streaming tutor — returns an EventSource-like via fetch
export const streamTutorAnswer = async (
  data: { courseId: string; chapterTitle: string; chapterContent: string; question: string },
  onDelta: (text: string) => void,
  onDone: (creditsRemaining?: number) => void,
  onError: (msg: string) => void
) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE}/tutor/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    onError(errData.message || "Tutor unavailable");
    return;
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      try {
        const json = JSON.parse(line.replace("data: ", ""));
        if (json.delta) onDelta(json.delta);
        if (json.done) onDone(json.creditsRemaining);
        if (json.error) onError(json.error);
      } catch {
        // skip malformed
      }
    }
  }
};

export const getUserCourseStats = async (courseId: string, userId: string) => {
  const res = await axios.get(`${BASE}/stats/${courseId}?userId=${userId}`);
  return res.data as { questionCredits: number; quizCredits: number };
};


export const getChatHistory = async (courseId: string) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE}/chat-history/${courseId}`, { headers });
  return res.data.history as ChatHistory[];
};

// ── Group Study Types ─────────────────────────────────────
export interface GroupMember {
  _id: string;
  userId: string;
  name: string;
  email: string;
  paymentStatus: "pending" | "paid" | "redistribution_pending" | "blocked";
  amountPaid: number;
  amountDue: number;
  joinedAt: string;
  paidAt: string | null;
  hasAccess: boolean;
}

export interface GroupStudyCourse {
  _id: string;
  courseId: string | null;
  creatorId: any;
  title: string;
  topic: string;
  groupSize: number;
  soloPrice: number;
  groupPrice: number;
  pricePerPerson: number;
  registrationDeadline: string;
  inviteToken: string;
  status: "open" | "locked" | "active" | "cancelled";
  members: GroupMember[];
  redistributionTriggered: boolean;
  redistributionAmount: number;
  generationStatus: string;
  skillLevel: string;
  createdAt: string;
}

// ── Service calls ──────────────────────────────────────────
export const createGroupStudy = async (data: {
  title: string; topic: string; groupSize: number;
  soloPrice: number; registrationDeadline: string;
  skillLevel: string; diagnosticAnswers: any[];
}) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${API_URL}/api/group-study/create`, data, { headers });
  return res.data as { success: boolean; group: GroupStudyCourse; inviteLink: string };
};

export const getGroupInviteDetails = async (inviteToken: string) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_URL}/api/group-study/join/${inviteToken}`, { headers });
  return res.data;
};

export const joinGroupStudy = async (inviteToken: string) => {
  const headers = await getAuthHeader();
  console.log(headers);

  const res = await axios.post(`${API_URL}/api/group-study/join/${inviteToken}`, {}, { headers });
  return res.data;
};

export const getGroupDetails = async (groupId: string) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_URL}/api/group-study/${groupId}`, { headers });
  return res.data as { success: boolean; group: GroupStudyCourse };
};

export const getMyGroups = async () => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_URL}/api/group-study/my-groups`, { headers });
  return res.data as { success: boolean; groups: GroupStudyCourse[] };
};

export const getGroupLeaderboard = async (groupId: string) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_URL}/api/group-study/${groupId}/leaderboard`, { headers });
  return res.data as { success: boolean; leaderboard: any[] };
};

export const getGroupByCourse = async (courseId: string) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_URL}/api/group-study/by-course/${courseId}`, { headers });
  return res.data as { success: boolean; group: GroupStudyCourse | null };
};

// ✅ Add this — it's called nowhere currently
export const payForGroupSlot = async (groupId: string) => {
  const headers = await getAuthHeader();
  const res = await axios.post(
    `${API_URL}/api/group-study/${groupId}/pay`,
    {},
    { headers }
  );
  return res.data;
};

export const getChapterVideo = async (
  courseId: string,
  chapterId: string,
  chapterTitle?: string,
  chapterContent?: string
) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_URL}/api/videos/${courseId}/${chapterId}`, {
    headers,
    params: {
      title: chapterTitle || "",
      content: chapterContent || "",
    },
  });
  return res.data;
};

export const pollVideoStatus = async (videoId: string) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_URL}/api/videos/status/${videoId}`, { headers });
  return res.data;
};


export default {
  getDiagnosticTest,
  generateCourse,
  getCourse,
  getMyCourses,
  getOrGenerateQuiz,
  getOrGeneratePodcast,
  completeChapter,
  payForCourse,
  streamTutorAnswer,
  getChatHistory,
  createGroupStudy,
  getGroupInviteDetails,
  joinGroupStudy,
  getGroupDetails,
  getMyGroups,
  getGroupLeaderboard,
  payForGroupSlot,
  getChapterVideo,
  pollVideoStatus,
};

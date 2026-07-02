// ============================================================
// PunterStat — Shared Type Definitions
// ============================================================

// --- User & Auth ---

export type UserRole = "user" | "premium" | "admin";

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// --- Courses ---

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  sortOrder: number;
}

export interface Course {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  level: "beginner" | "intermediate" | "advanced";
  isPremium: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  content: string | null;
  videoUrl: string | null;
  duration: number | null; // seconds
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  progressPct: number;
}

// --- Bookmarks ---

export interface Bookmark {
  id: string;
  userId: string;
  lessonId: string;
  createdAt: string;
}

// --- Simulation ---

export interface SimulationSession {
  id: string;
  userId: string;
  type: "bet" | "probability";
  virtualBalance: number;
  startingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationHistory {
  id: string;
  sessionId: string;
  odds: number;
  stake: number;
  outcome: "win" | "loss";
  profitLoss: number;
  balanceAfter: number;
  createdAt: string;
}

// --- Match Analysis ---

export interface SportsMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  matchDate: string;
  status: "upcoming" | "live" | "completed";
  homeScore: number | null;
  awayScore: number | null;
  createdAt: string;
}

export interface MatchAnalysis {
  id: string;
  matchId: string;
  authorId: string;
  content: string;
  homeFormRating: number | null;
  awayFormRating: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Blog ---

export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnailUrl: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Subscriptions ---

export type SubscriptionPlan = "free" | "premium" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trialing";

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Notifications ---

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

// --- Feature Flags ---

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
}

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- API Responses ---

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

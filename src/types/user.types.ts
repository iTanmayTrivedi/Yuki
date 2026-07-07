export type PlanTier = "free" | "pro" | "founder";

export type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  location: string | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UserPlan = {
  user_id: string;
  tier: PlanTier;
  credits_used: number;
  credits_limit: number;
  billing_date: string | null;
};

export type MemoryFact = {
  id: string;
  user_id: string;
  fact: string;
  category: string;
  confidence: number;
  source: string;
  active: boolean;
  created_at?: string;
};

export type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  criteria: Record<string, number>;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: Record<string, number>;
};

export type UserStreak = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

export type Journey = {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  category: string;
  target_date: string | null;
  progress_pct: number;
  milestone_count: number;
  last_active_at: string;
};
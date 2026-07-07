import type { PlanTier } from "@/types/user.types";

export const APP_NAME = "Yuki";
export const APP_TAGLINE = "Your AI companion for Japan";

export const PLAN_LIMITS: Record<PlanTier, { credits: number; label: string }> = {
  free:    { credits: 100,   label: "Free" },
  pro:     { credits: 2000,  label: "Pro" },
  founder: { credits: 10000, label: "Founder" },
};

export const INTENT_LABELS = {
  career:   "Career & work",
  visa:     "Visa & moving",
  language: "Language",
  travel:   "Travel",
  culture:  "Culture",
  general:  "General",
} as const;

export const FEATURE_FLAGS = {
  thinkDeeper: true,
  richResponses: true,
  memory: true,
  streaks: true,
  discover: true,
  premium: false,
} as const;

export const CHAT_API_PATH = "/functions/v1/chat";
import { create } from "zustand";
import type { MemoryFact, UserPlan, UserProfile, UserStreak } from "@/types/user.types";

type State = {
  profile: UserProfile | null;
  plan: UserPlan | null;
  memory: MemoryFact[];
  streak: UserStreak | null;
  setProfile: (p: UserProfile | null) => void;
  setPlan: (p: UserPlan | null) => void;
  setMemory: (m: MemoryFact[]) => void;
  addMemory: (m: MemoryFact) => void;
  setStreak: (s: UserStreak | null) => void;
  reset: () => void;
};

export const useUserStore = create<State>((set) => ({
  profile: null,
  plan: null,
  memory: [],
  streak: null,
  setProfile: (profile) => set({ profile }),
  setPlan: (plan) => set({ plan }),
  setMemory: (memory) => set({ memory }),
  addMemory: (m) => set((s) => ({ memory: [m, ...s.memory] })),
  setStreak: (streak) => set({ streak }),
  reset: () => set({ profile: null, plan: null, memory: [], streak: null }),
}));
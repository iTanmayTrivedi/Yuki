import { create } from "zustand";

type Theme = "light" | "dark" | "system";

type State = {
  sidebarOpen: boolean;
  discoverOpen: boolean;
  theme: Theme;
  thinkDeeper: boolean;
  setSidebar: (v: boolean) => void;
  setDiscover: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  setThinkDeeper: (v: boolean) => void;
};

export const useUIStore = create<State>((set) => ({
  sidebarOpen: false,
  discoverOpen: true,
  theme: "system",
  thinkDeeper: false,
  setSidebar: (sidebarOpen) => set({ sidebarOpen }),
  setDiscover: (discoverOpen) => set({ discoverOpen }),
  setTheme: (theme) => set({ theme }),
  setThinkDeeper: (thinkDeeper) => set({ thinkDeeper }),
}));
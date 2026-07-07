import { useUIStore } from "@/store/ui-store";

export function useThinkDeeper() {
  const on = useUIStore((s) => s.thinkDeeper);
  const set = useUIStore((s) => s.setThinkDeeper);
  return { on, toggle: () => set(!on), set };
}
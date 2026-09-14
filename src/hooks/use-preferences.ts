import { useCallback, useEffect, useState } from "react";

export type Preferences = {
  theme: "light" | "dark";
  language: string;
  voice: string;
  region: string;
  units: "metric" | "imperial";
  responseStyle: "concise" | "balanced" | "detailed";
  proactive: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "light",
  language: "English",
  voice: "Yuki (Female)",
  region: "Japan",
  units: "metric",
  responseStyle: "balanced",
  proactive: true,
};

const KEY = "yuki.preferences";
const EVENT = "yuki:preferences";

export function readPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function applyTheme(theme: Preferences["theme"]) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** Reads preferences, keeps them in sync across components/tabs, applies theme. */
export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readPreferences();
    setPrefs(initial);
    applyTheme(initial.theme);
    setHydrated(true);

    const sync = () => setPrefs(readPreferences());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      if (key === "theme") applyTheme(next.theme);
      window.dispatchEvent(new Event(EVENT));
      return next;
    });
  }, []);

  return { prefs, update, hydrated };
}

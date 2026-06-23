"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { updateOwnConfiguration } from "@/api/user";
import { message } from "@/components/StyledComponents";
import {
  PREFERENCE_THEME_SCALE_STORAGE_KEY,
  PREFERENCE_THEME_STORAGE_KEY,
  type ThemeName,
} from "@/config/userConfiguration";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";

const THEME_SCALE_FROM_THEME: Record<ThemeName, number> = {
  sumie: 0,
  "tokyo-dusk": 50,
  "night-sky": 100,
};

const readStoredThemeScale = (theme: ThemeName): number => {
  if (typeof window === "undefined") return THEME_SCALE_FROM_THEME[theme];
  const storedScale = window.localStorage.getItem(PREFERENCE_THEME_SCALE_STORAGE_KEY);
  if (!storedScale) return THEME_SCALE_FROM_THEME[theme];
  const parsedScale = Number.parseInt(storedScale, 10);
  if (Number.isNaN(parsedScale)) return THEME_SCALE_FROM_THEME[theme];
  return Math.max(0, Math.min(100, parsedScale));
};

type ThemeScaleContextValue = {
  progress: number;
  setPreviewProgress: (progress: number | null) => void;
  commitScale: (progress: number) => void;
};

const ThemeScaleContext = createContext<ThemeScaleContextValue | null>(null);

export const ThemeScaleProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { isLoggedIn } = useAuthenticationState();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Profile");
  const [progress, setProgress] = useState<number>(() => THEME_SCALE_FROM_THEME[theme]);

  useEffect(() => {
    setProgress(readStoredThemeScale(theme));
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const rootStyle = document.documentElement.style;
    const preview = getThemeScaleVars(progress);
    for (const key of Object.keys(preview)) {
      rootStyle.setProperty(key, preview[key]);
    }
    return () => {
      const keys = Object.keys(getThemeScaleVars(0));
      for (const key of keys) {
        rootStyle.removeProperty(key);
      }
    };
  }, [progress]);

  const persistTheme = useCallback(
    async (nextTheme: ThemeName) => {
      if (!isLoggedIn) return;
      try {
        await updateOwnConfiguration({ theme: nextTheme });
        router.refresh();
      } catch {
        message.error(t("preferencesSaveError"));
      }
    },
    [isLoggedIn, router, t],
  );

  const commitScale = useCallback(
    (nextProgress: number) => {
      const clamped = Math.max(0, Math.min(100, nextProgress));
      setProgress(clamped);
      const nextTheme = getPersistedThemeFromScale(clamped);
      setTheme(nextTheme);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PREFERENCE_THEME_STORAGE_KEY, nextTheme);
        window.localStorage.setItem(PREFERENCE_THEME_SCALE_STORAGE_KEY, String(clamped));
      }
      void persistTheme(nextTheme);
    },
    [persistTheme, setTheme],
  );

  const setPreviewProgress = useCallback((next: number | null) => {
    if (next === null) return;
    setProgress(Math.max(0, Math.min(100, next)));
  }, []);

  const value = useMemo(
    () => ({ progress, setPreviewProgress, commitScale }),
    [commitScale, progress, setPreviewProgress],
  );

  return <ThemeScaleContext.Provider value={value}>{children}</ThemeScaleContext.Provider>;
};

export const useThemeScaleContext = () => {
  const context = useContext(ThemeScaleContext);
  if (!context) {
    throw new Error("useThemeScaleContext must be used within ThemeScaleProvider");
  }
  return context;
};

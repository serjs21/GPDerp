"use client";

import { useUserPreferencesSync } from "@/hooks/useUserPreferencesSync";

export function UserPreferencesSync() {
  useUserPreferencesSync();
  return null;
}

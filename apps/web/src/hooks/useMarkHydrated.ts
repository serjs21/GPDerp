"use client";

import { useEffect } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";

export const useMarkHydrated = () => {
  const { initialized } = useAuthenticationState();

  useEffect(() => {
    if (!initialized) return;
    // Marks hydration done; CSS will fade out the loader.
    document.documentElement.dataset.hydrated = "true";
  }, [initialized]);
}

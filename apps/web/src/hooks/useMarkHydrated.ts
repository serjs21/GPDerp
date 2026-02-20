"use client";

import { useEffect } from "react";

export const useMarkHydrated = () => {  
  useEffect(() => {
    // Marks hydration done; CSS will fade out the loader.
    document.documentElement.dataset.hydrated = "true";
  }, []);
}
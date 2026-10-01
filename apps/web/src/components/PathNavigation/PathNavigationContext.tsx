"use client";

import { createContext, useContext } from "react";
import type { PathNavigationProviderProps, PathNavigationValue } from "./PathNavigation.types";

const PathNavigationContext = createContext<PathNavigationValue | null>(null);

export function usePathNavigation(): PathNavigationValue | null {
  return useContext(PathNavigationContext);
}

export function PathNavigationProvider({ value, children }: PathNavigationProviderProps) {
  return <PathNavigationContext.Provider value={value}>{children}</PathNavigationContext.Provider>;
}

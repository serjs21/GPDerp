"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const LanternActionsDockContext = createContext<HTMLElement | null>(null);

export function useLanternActionsDock(): HTMLElement | null {
  return useContext(LanternActionsDockContext);
}

export function LanternActionsDockProvider({
  children,
}: {
  children: (dockRef: (node: HTMLElement | null) => void) => ReactNode;
}) {
  const [dock, setDock] = useState<HTMLElement | null>(null);
  const dockRef = useCallback((node: HTMLElement | null) => {
    setDock(node);
  }, []);
  const value = useMemo(() => dock, [dock]);

  return (
    <LanternActionsDockContext.Provider value={value}>
      {children(dockRef)}
    </LanternActionsDockContext.Provider>
  );
}

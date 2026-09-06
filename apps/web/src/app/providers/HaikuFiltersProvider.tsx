"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type HaikuFiltersState = {
  searchString: string;
  setSearchString: (value: string) => void;
  selectedLabelIds: string[];
  setSelectedLabelIds: (ids: string[]) => void;
  removeLabelId: (id: string) => void;
};

const HaikuFiltersContext = createContext<HaikuFiltersState | undefined>(undefined);

export function HaikuFiltersProvider({ children }: { children: ReactNode }) {
  const [searchString, setSearchString] = useState("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const removeLabelId = useCallback((id: string) => {
    setSelectedLabelIds((prev) => prev.filter((labelId) => labelId !== id));
  }, []);

  const value = useMemo(
    (): HaikuFiltersState => ({
      searchString,
      setSearchString,
      selectedLabelIds,
      setSelectedLabelIds,
      removeLabelId,
    }),
    [searchString, selectedLabelIds, removeLabelId],
  );

  return (
    <HaikuFiltersContext.Provider value={value}>{children}</HaikuFiltersContext.Provider>
  );
}

export function useHaikuFilters(): HaikuFiltersState {
  const ctx = useContext(HaikuFiltersContext);
  if (!ctx) {
    throw new Error("useHaikuFilters must be used within HaikuFiltersProvider");
  }
  return ctx;
}

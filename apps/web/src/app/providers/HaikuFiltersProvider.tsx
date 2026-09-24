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
  excludedLabelIds: string[];
  setExcludedLabelIds: (ids: string[]) => void;
  removeExcludedLabelId: (id: string) => void;
  setLabelFilters: (next: {
    includeIds: string[];
    excludeIds: string[];
  }) => void;
};

const HaikuFiltersContext = createContext<HaikuFiltersState | undefined>(undefined);

export function HaikuFiltersProvider({ children }: { children: ReactNode }) {
  const [searchString, setSearchString] = useState("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [excludedLabelIds, setExcludedLabelIds] = useState<string[]>([]);

  const removeLabelId = useCallback((id: string) => {
    setSelectedLabelIds((prev) => prev.filter((labelId) => labelId !== id));
  }, []);

  const removeExcludedLabelId = useCallback((id: string) => {
    setExcludedLabelIds((prev) => prev.filter((labelId) => labelId !== id));
  }, []);

  const setLabelFilters = useCallback(
    (next: { includeIds: string[]; excludeIds: string[] }) => {
      const includeSet = new Set(next.includeIds);
      setSelectedLabelIds(next.includeIds);
      setExcludedLabelIds(next.excludeIds.filter((id) => !includeSet.has(id)));
    },
    [],
  );

  const value = useMemo(
    (): HaikuFiltersState => ({
      searchString,
      setSearchString,
      selectedLabelIds,
      setSelectedLabelIds,
      removeLabelId,
      excludedLabelIds,
      setExcludedLabelIds,
      removeExcludedLabelId,
      setLabelFilters,
    }),
    [
      searchString,
      selectedLabelIds,
      removeLabelId,
      excludedLabelIds,
      removeExcludedLabelId,
      setLabelFilters,
    ],
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

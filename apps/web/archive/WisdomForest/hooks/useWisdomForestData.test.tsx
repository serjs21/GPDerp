jest.mock("@/hooks/useInfiniteHaikusQuery", () => ({
  useInfiniteHaikusQuery: jest.fn(),
}));

import { renderHook } from "@testing-library/react";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { useWisdomForestData } from "./useWisdomForestData";

const mockUseInfiniteHaikusQuery = jest.mocked(useInfiniteHaikusQuery);

describe("useWisdomForestData", () => {
  beforeEach(() => {
    mockUseInfiniteHaikusQuery.mockReturnValue({
      initialized: true,
      isLoggedIn: true,
      haikus: [],
      isInitialLoading: false,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      invalidate: jest.fn(),
    } as ReturnType<typeof useInfiniteHaikusQuery>);
  });

  it("returns ready when initialized and logged in", () => {
    const { result } = renderHook(() => useWisdomForestData(3, { enabled: true }));
    expect(result.current.ready).toBe(true);
  });

  it("returns not ready when logged out", () => {
    mockUseInfiniteHaikusQuery.mockReturnValue({
      initialized: true,
      isLoggedIn: false,
      haikus: [],
      isInitialLoading: false,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      invalidate: jest.fn(),
    } as ReturnType<typeof useInfiniteHaikusQuery>);

    const { result } = renderHook(() => useWisdomForestData(3, { enabled: true }));
    expect(result.current.ready).toBe(false);
  });
});

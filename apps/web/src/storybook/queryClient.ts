import { QueryClient } from "@tanstack/react-query";

/** Storybook-safe React Query client (no retries, fast failure). */
export function createStoryQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

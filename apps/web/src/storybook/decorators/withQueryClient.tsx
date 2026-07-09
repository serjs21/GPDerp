import type { Decorator } from "@storybook/nextjs-vite";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { createStoryQueryClient } from "../queryClient";

/**
 * Wraps a story with React Query. Use for any component that calls useQuery,
 * useMutation, or opens modals/actions backed by the query client.
 */
export const withQueryClient: Decorator = (Story) => {
  const qc = createStoryQueryClient();
  return (
    <QueryClientProvider client={qc}>
      <Story />
    </QueryClientProvider>
  );
};

/** Story decorator with a pre-seeded query client (labels cache, etc.). */
export function withQueryClientSeed(seed: (qc: QueryClient) => void): Decorator {
  function withSeededQueryClient(Story: Parameters<Decorator>[0]) {
    const qc = createStoryQueryClient();
    seed(qc);
    return (
      <QueryClientProvider client={qc}>
        <Story />
      </QueryClientProvider>
    );
  }
  return withSeededQueryClient;
}

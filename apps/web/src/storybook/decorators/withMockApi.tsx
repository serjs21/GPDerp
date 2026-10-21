import type { Decorator } from "@storybook/nextjs-vite";
import { useEffect, useState, type ReactNode } from "react";
import { installStoryApi, uninstallStoryApi, type StoryApiRoute } from "../mockApi/storyApi";

function StoryApiScope({ routes, children }: { routes: readonly StoryApiRoute[]; children: ReactNode }) {
  // Installed during render: descendants start their queries in effects, after this has run.
  const [token] = useState(() => installStoryApi(routes));
  useEffect(() => () => uninstallStoryApi(token), [token]);
  return children;
}

/**
 * Answers the story's axios requests from `routes` (see storyApi.ts): fixture data, empty lists, or
 * STORY_API_PENDING for loading states. Anything not listed fails instead of reaching a real API.
 */
export function withMockApi(routes: readonly StoryApiRoute[]): Decorator {
  function withStoryApi(Story: Parameters<Decorator>[0]) {
    return (
      <StoryApiScope routes={routes}>
        <Story />
      </StoryApiScope>
    );
  }
  return withStoryApi;
}

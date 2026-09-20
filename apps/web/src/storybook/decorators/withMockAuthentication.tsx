import type { Decorator } from "@storybook/nextjs-vite";
import { MockAuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { STORY_LOGGED_IN_AUTH } from "../fixtures/loggedInUser";

/** Logged-in auth context without layout chrome (for lantern/actions/share stories). */
export const withMockAuthentication: Decorator = (Story) => (
  <MockAuthenticationProvider value={STORY_LOGGED_IN_AUTH}>
    <Story />
  </MockAuthenticationProvider>
);

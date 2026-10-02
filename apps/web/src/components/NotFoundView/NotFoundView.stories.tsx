"use client";

import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { MockAuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import type { AuthenticationResult } from "@/hooks/useAuthentication";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { composeDecorators, withQueryClient, withThemedStoryStage } from "@/storybook";
import { NotFoundView } from "./NotFoundView";

const LOGGED_OUT_AUTH: AuthenticationResult = {
  initialized: true,
  isLoggedIn: false,
  user: null,
  account: [],
  logout: async () => undefined,
  checkAuthentication: () => undefined,
};

const withLoggedOutAuth: Decorator = (Story) => (
  <MockAuthenticationProvider value={LOGGED_OUT_AUTH}>
    <AuthenticationVerificationProvider>
      <Story />
    </AuthenticationVerificationProvider>
  </MockAuthenticationProvider>
);

const meta: Meta<typeof NotFoundView> = {
  title: "Haiku/NotFoundView",
  component: NotFoundView,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withLoggedOutAuth, withThemedStoryStage)],
};

export default meta;
type Story = StoryObj<typeof NotFoundView>;

export const Default: Story = {};

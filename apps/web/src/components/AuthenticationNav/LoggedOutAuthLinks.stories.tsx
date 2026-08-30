import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import { AuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import { LoggedOutAuthLinks } from "./LoggedOutAuthLinks";

const shellDecorator = (Story: () => ReactNode) => (
  <div
    style={{
      padding: "2rem",
      minHeight: 140,
      background: "var(--background)",
      color: "var(--text-color)",
    }}
  >
    <Story />
  </div>
);

const authProviders = (Story: () => ReactNode) => (
  <AuthenticationProvider>
    <AuthenticationVerificationProvider>
      <Story />
    </AuthenticationVerificationProvider>
  </AuthenticationProvider>
);

const meta = {
  title: "Archive/Components/LoggedOutAuthLinks",
  component: LoggedOutAuthLinks,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Logged-out header auth control using the duality toggle design. Default story uses real auth providers.",
      },
    },
  },
  decorators: [shellDecorator, authProviders],
} satisfies Meta<typeof LoggedOutAuthLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default (full component)",
};

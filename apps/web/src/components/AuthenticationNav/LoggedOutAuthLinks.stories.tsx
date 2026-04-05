import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoggedOutAuthLinks } from "./LoggedOutAuthLinks";

const meta = {
  title: "Auth/AuthenticationNav/LoggedOutAuthLinks",
  component: LoggedOutAuthLinks,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof LoggedOutAuthLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};


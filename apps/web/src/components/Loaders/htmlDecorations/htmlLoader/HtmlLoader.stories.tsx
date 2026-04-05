import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HtmlLoader } from "./index";

const meta = {
  title: "Loaders/HtmlLoader",
  component: HtmlLoader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HtmlLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full-viewport Fuji scene used as the initial HTML shell loader. */
export const Default: Story = {};

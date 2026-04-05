import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SakuraPetalLoader } from "./SakuraPetalLoader";

const meta = {
  title: "Loaders/SakuraPetalLoader",
  component: SakuraPetalLoader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "min(420px, 90vw)",
          minHeight: "8rem",
          padding: "1.5rem 0",
          boxSizing: "border-box",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SakuraPetalLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

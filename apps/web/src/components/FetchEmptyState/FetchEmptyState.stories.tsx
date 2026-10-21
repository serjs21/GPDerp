import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FetchEmptyState } from "./FetchEmptyState";

const meta = {
  title: "Feedback/FetchEmptyState",
  component: FetchEmptyState,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: "24rem", background: "#f7f4ef" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FetchEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

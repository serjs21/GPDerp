import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tooltip } from "@/components/StyledComponents";

import { SakuraPetalLoader } from "./SakuraPetalLoader";

const meta = {
  title: "Loaders/SakuraPetalLoader/Compact",
  component: SakuraPetalLoader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    compact: true,
    scale: 1,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "5rem",
          padding: "1rem",
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

export const Default: Story = {
  args: { compact: true, scale: 1 },
};

export const Small: Story = {
  args: { compact: true, scale: 0.65 },
};

export const Medium: Story = {
  args: { compact: true, scale: 0.85 },
};

export const Large: Story = {
  args: { compact: true, scale: 1.15 },
};

export const SizeComparison: Story = {
  name: "Size comparison",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "1.75rem",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {[0.55, 0.72, 0.9, 1.1].map((scale) => (
        <SakuraPetalLoader key={scale} compact scale={scale} />
      ))}
    </div>
  ),
};

export const WithHoverTooltip: Story = {
  name: "With hover tooltip (like HaikuActions)",
  render: (args) => (
    <Tooltip title="Saving this haiku… Label and delete stay disabled until it is stored.">
      <span style={{ display: "inline-flex", alignItems: "center", height: "1.5rem" }}>
        <SakuraPetalLoader {...args} />
      </span>
    </Tooltip>
  ),
  args: { compact: true, scale: 1 },
};

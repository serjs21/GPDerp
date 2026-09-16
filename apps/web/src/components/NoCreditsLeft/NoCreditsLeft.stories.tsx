import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { NoCreditsLeft } from "./NoCreditsLeft";

const meta = {
  title: "Haiku/NoCreditsLeft",
  component: NoCreditsLeft,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    onBuy: () => undefined,
    buying: false,
    buyDisabled: false,
  },
} satisfies Meta<typeof NoCreditsLeft>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Buying: Story = {
  args: {
    buying: true,
  },
};

export const Interactive: Story = {
  render: function InteractiveNoCreditsLeft() {
    const [open, setOpen] = useState(true);

    return (
      <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Show no-credits modal
        </Button>
        <NoCreditsLeft open={open} onOpenChange={setOpen} onBuy={() => setOpen(false)} />
      </div>
    );
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { DeleteFailedModal } from "./DeleteFailedModal";

const meta = {
  title: "Archive/Haiku/DeleteFailedModal",
  component: DeleteFailedModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
    retrying: false,
    onRetry: () => undefined,
    onLeaveItBe: () => undefined,
  },
} satisfies Meta<typeof DeleteFailedModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Retrying: Story = {
  args: {
    retrying: true,
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};

export const Interactive: Story = {
  render: function InteractiveDeleteFailed() {
    const [open, setOpen] = useState(true);
    const [retrying, setRetrying] = useState(false);

    return (
      <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Show failure modal
        </Button>
        <DeleteFailedModal
          open={open}
          retrying={retrying}
          onRetry={() => {
            setRetrying(true);
            window.setTimeout(() => {
              setRetrying(false);
              setOpen(false);
            }, 800);
          }}
          onLeaveItBe={() => {
            setRetrying(false);
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

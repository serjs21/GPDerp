import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

const meta = {
  title: "Haiku/DeleteConfirmModal",
  component: DeleteConfirmModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    onConfirm: () => undefined,
    confirming: false,
  },
} satisfies Meta<typeof DeleteConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Confirming: Story = {
  args: {
    confirming: true,
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};

export const Interactive: Story = {
  render: function InteractiveDeleteConfirm() {
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [lastAction, setLastAction] = useState("—");

    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", gap: "0.75rem" }}>
        <p style={{ margin: 0, fontFamily: "cursive" }}>Last action: {lastAction}</p>
        <Button type="primary" onClick={() => setOpen(true)}>
          Delete lantern
        </Button>
        <DeleteConfirmModal
          open={open}
          onOpenChange={setOpen}
          confirming={confirming}
          onConfirm={() => {
            setConfirming(true);
            setLastAction("Let it fly");
            window.setTimeout(() => {
              setConfirming(false);
              setOpen(false);
            }, 800);
          }}
        />
      </div>
    );
  },
};

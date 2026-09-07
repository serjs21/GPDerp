import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { ComicConfirmModal } from "./ComicConfirmModal";

const meta = {
  title: "Haiku/ComicConfirmModal",
  component: ComicConfirmModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    question: "Delete this haiku?",
    confirmLabel: "Delete",
    cancelLabel: "Not yet",
    closeOnOverlayClick: true,
    closeOnSelect: true,
    onConfirm: () => undefined,
  },
} satisfies Meta<typeof ComicConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DeleteFailedLike: Story = {
  args: {
    question: "Deletion failed!",
    cancelLabel: "Leave it be",
    confirmLabel: "Retry",
  },
};

export const LongQuestion: Story = {
  args: {
    question:
      "This haiku has been shared with others. Are you sure you want to remove it from your path?",
    cancelLabel: "Keep it here",
    confirmLabel: "Remove anyway",
  },
};

function InteractiveComicConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [lastChoice, setLastChoice] = useState<string>("—");

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", gap: "0.75rem" }}>
      <p style={{ margin: 0, fontFamily: "cursive" }}>Last choice: {lastChoice}</p>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open comic confirm
      </Button>
      <ComicConfirmModal
        open={open}
        onOpenChange={setOpen}
        question="Send this lantern away?"
        cancelLabel="Not yet"
        confirmLabel="Let it fly"
        onConfirm={() => setLastChoice("Let it fly")}
        onCancel={() => setLastChoice("Not yet")}
      />
    </div>
  );
}

export const Interactive: Story = {
  args: {
    open: false,
  },
  render: () => <InteractiveComicConfirmDemo />,
};

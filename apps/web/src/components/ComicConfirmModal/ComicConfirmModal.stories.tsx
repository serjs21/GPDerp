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
    questionBubbleStyle: "pointedArcs",
    optionsLayout: "auto",
    closeOnOverlayClick: false,
    closeOnSelect: true,
    options: [
      {
        id: "cancel",
        label: "Leave it be",
        onSelect: () => undefined,
        bubbleStyle: "speech",
      },
      {
        id: "confirm",
        label: "Retry",
        onSelect: () => undefined,
        bubbleStyle: "speech",
      },
    ],
  },
} satisfies Meta<typeof ComicConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThreeOptions: Story = {
  args: {
    question: "Where should this lantern go?",
    options: [
      { id: "path", label: "Keep on path", onSelect: () => undefined, bubbleStyle: "speech" },
      { id: "library", label: "Move to library", onSelect: () => undefined, bubbleStyle: "circle" },
      { id: "archive", label: "Archive", onSelect: () => undefined, bubbleStyle: "rectangle" },
    ],
  },
};

export const DeleteFailedLike: Story = {
  args: {
    question: "Deletion failed!",
    questionBubbleStyle: "pointedArcs",
    options: [
      { id: "leave", label: "Leave it be", onSelect: () => undefined },
      { id: "retry", label: "Retry", onSelect: () => undefined, bubbleStyle: "pointedArcs" },
    ],
  },
};

export const LongQuestion: Story = {
  args: {
    question:
      "This haiku has been shared with others. Are you sure you want to remove it from your path and send it back to the shelf?",
    questionBubbleStyle: "speech",
    optionsLayout: "column",
    options: [
      { id: "keep", label: "Keep it here", onSelect: () => undefined },
      { id: "remove", label: "Remove anyway", onSelect: () => undefined },
    ],
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
        options={[
          {
            id: "stay",
            label: "Not yet",
            onSelect: () => setLastChoice("Not yet"),
          },
          {
            id: "go",
            label: "Let it fly",
            onSelect: () => setLastChoice("Let it fly"),
            bubbleStyle: "pointedArcs",
          },
        ]}
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

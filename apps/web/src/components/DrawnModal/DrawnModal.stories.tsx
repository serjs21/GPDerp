import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { DrawnModal } from "./DrawnModal";

const meta = {
  title: "Haiku/DrawnModal",
  component: DrawnModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: "Ink along the edge",
    description: "Each side of the frame draws in turn, then the close mark, then the words.",
    size: "md",
    showClose: true,
    roughSeed: 42,
  },
} satisfies Meta<typeof DrawnModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
  args: {
    title: "A longer scroll",
    size: "lg",
    description: undefined,
    children: (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index} style={{ margin: 0 }}>
            Line {index + 1}: the rough border finishes first so body copy stays readable on its
            own layer — no stroke animation on the text itself.
          </p>
        ))}
      </div>
    ),
    footer: <Button type="primary">Done</Button>,
  },
};

function InteractiveDrawnModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open drawn modal
      </Button>
      <DrawnModal
        open={open}
        onOpenChange={setOpen}
        title="Drawn into place"
        roughSeed={11}
        footer={
          <Button type="primary" onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        Watch the border draw one side at a time, then the X, then this copy fades in. Closing
        fades the shell out — no reverse undraw in v1.
      </DrawnModal>
    </div>
  );
}

export const Interactive: Story = {
  args: {
    open: false,
  },
  render: () => <InteractiveDrawnModalDemo />,
};

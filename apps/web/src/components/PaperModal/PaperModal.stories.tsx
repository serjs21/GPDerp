import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { PaperModal } from "./PaperModal";

const meta = {
  title: "Archive/Haiku/PaperModal",
  component: PaperModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: "A note on washi",
    description: "Handmade paper enters the scene with a soft drop and a quiet settle.",
    size: "md",
    showClose: true,
    motionPreset: "dropSettle",
    roughSeed: 42,
  },
} satisfies Meta<typeof PaperModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: {
    title: "Seal this letter?",
    description: undefined,
    children: "Once sealed, the ink stays as it is. You can still keep drafting elsewhere.",
    footer: (
      <>
        <Button>Keep open</Button>
        <Button type="primary">Seal</Button>
      </>
    ),
  },
};

export const LongContent: Story = {
  args: {
    title: "Long scroll on paper",
    size: "lg",
    description: undefined,
    children: (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index} style={{ margin: 0 }}>
            Line {index + 1}: the washi sheet keeps its deckled edge while body text stays on a clean
            layer above the grain — readable even when the surface is irregular.
          </p>
        ))}
      </div>
    ),
    footer: <Button type="primary">Done</Button>,
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    title: "Brief note",
    description: "A smaller sheet for short confirmations.",
  },
};

function InteractivePaperModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open paper modal
      </Button>
      <PaperModal
        open={open}
        onOpenChange={setOpen}
        title="Dropped into view"
        roughSeed={7}
        footer={
          <Button type="primary" onClick={() => setOpen(false)}>
            Put away
          </Button>
        }
      >
        Watch the sheet drift in and settle. Closing lifts it away softly rather than snapping
        out of place.
      </PaperModal>
    </div>
  );
}

export const Interactive: Story = {
  args: {
    open: false,
  },
  render: () => <InteractivePaperModalDemo />,
};

export const ReducedMotionHint: Story = {
  name: "Reduced motion (OS setting)",
  args: {
    title: "Respects prefers-reduced-motion",
    description:
      "Enable reduced motion in your OS/browser to see the short fade/translate path instead of the drop-wobble.",
  },
};

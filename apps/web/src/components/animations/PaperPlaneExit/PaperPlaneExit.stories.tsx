import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { HaikuGenerationStickyNoteShell } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteShell/HaikuGenerationStickyNoteShell";
import { PaperPlaneExit } from "./PaperPlaneExit";

const exampleBody = `Shadow questions rise,
a void whispers, "Who are you?"
Self slips through the cracks.`;

function MockStickyCard() {
  return (
    <div style={{ width: 360, height: "12.5rem" }}>
      <HaikuGenerationStickyNoteShell
        title="Autumn wind"
        meta="2:30 PM"
        body={exampleBody}
        rotate={-0.8}
      />
    </div>
  );
}

const meta = {
  title: "Animations/PaperPlaneExit",
  component: PaperPlaneExit,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof PaperPlaneExit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    active: false,
    children: <MockStickyCard />,
  },
};

export const FoldAndFly: Story = {
  args: {
    active: false,
    children: <MockStickyCard />,
  },
  render: () => {
    const [active, setActive] = useState(false);

    useEffect(() => {
      const timer = window.setTimeout(() => setActive(true), 600);
      return () => window.clearTimeout(timer);
    }, []);

    return (
      <PaperPlaneExit active={active} onComplete={() => setActive(false)}>
        <MockStickyCard />
      </PaperPlaneExit>
    );
  },
};

export const TriggerOnClick: Story = {
  args: {
    active: false,
    children: <MockStickyCard />,
  },
  render: () => {
    const [active, setActive] = useState(false);
    const [key, setKey] = useState(0);

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <button
          type="button"
          onClick={() => {
            setActive(true);
          }}
        >
          Fly away
        </button>
        <PaperPlaneExit
          key={key}
          active={active}
          onComplete={() => {
            setActive(false);
            setKey((k) => k + 1);
          }}
        >
          <MockStickyCard />
        </PaperPlaneExit>
      </div>
    );
  },
};

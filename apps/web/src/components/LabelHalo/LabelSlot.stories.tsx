import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { LabelSlot } from "./LabelSlot";
import type { LabelPlacement } from "./consts/labelHaloConsts";

const meta = {
  title: "Haiku/LabelHalo/LabelSlot",
  component: LabelSlot,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    id: "slot-1",
    name: "Moonlight",
    color: "#f4511e",
    shape: "classic",
    connectionPointId: "mr",
    rotateDeg: 0,
  },
} satisfies Meta<typeof LabelSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Rotated: Story = {
  args: {
    rotateDeg: -22,
    connectionPointId: "bl",
  },
};

export const Interactive: Story = {
  render: function InteractiveLabelSlot() {
    const [placement, setPlacement] = useState<LabelPlacement>({
      connectionPointId: "mr",
      rotateDeg: 0,
    });
    return (
      <div style={{ padding: "3rem", background: "#1a2744", borderRadius: "0.5rem" }}>
        <LabelSlot
          id="interactive"
          name="Pond"
          color="#13c2c2"
          shape="classic"
          connectionPointId={placement.connectionPointId}
          rotateDeg={placement.rotateDeg}
          onPlacementCommit={setPlacement}
        />
        <p
          style={{
            marginTop: "1.25rem",
            color: "#fff",
            fontFamily: "monospace",
            fontSize: "0.85rem",
          }}
        >
          point={placement.connectionPointId} rotate={placement.rotateDeg}°
          (commits on focus out)
        </p>
      </div>
    );
  },
};

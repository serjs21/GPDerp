import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { LabelHalo } from "./LabelHalo";
import {
  DEFAULT_LABEL_HALO_CONNECTION_POINTS,
  type LabelHaloLabelItem,
  type LabelPlacement,
} from "./consts/labelHaloConsts";

const SAMPLE_LABELS: LabelHaloLabelItem[] = [
  {
    id: "1",
    name: "Crow",
    color: "#fa541c",
    shape: "classic",
    connectionPointId: "bl",
    rotateDeg: -22,
  },
  {
    id: "2",
    name: "Pond",
    color: "#13c2c2",
    shape: "classic",
    connectionPointId: "mr",
    rotateDeg: 0,
  },
  {
    id: "3",
    name: "Autumn",
    color: "#faad14",
    shape: "classic",
    connectionPointId: "tl",
    rotateDeg: 22,
  },
];

const meta = {
  title: "Haiku/LabelHalo",
  component: LabelHalo,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof LabelHalo>;

export default meta;
type Story = StoryObj<typeof meta>;

function HaloHost({
  initialLabels,
}: {
  initialLabels: LabelHaloLabelItem[];
}) {
  const [labels, setLabels] = useState(initialLabels);

  const onPlacementCommit = (labelId: string, placement: LabelPlacement) => {
    setLabels((current) =>
      current.map((label) =>
        label.id === labelId
          ? {
              ...label,
              connectionPointId: placement.connectionPointId,
              rotateDeg: placement.rotateDeg,
            }
          : label,
      ),
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "22rem",
        height: "22rem",
        background:
          "radial-gradient(circle at 50% 45%, #3d5a80 0%, #1a2744 70%)",
        borderRadius: "0.75rem",
        border: "4px solid #111",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "4.5rem",
          height: "7rem",
          transform: "translate(-50%, -50%)",
          borderRadius: "2rem 2rem 0.5rem 0.5rem",
          background: "#c9a227",
          border: "3px solid #111",
          opacity: 0.85,
        }}
        aria-hidden
      />
      <LabelHalo
        labels={labels}
        connectionPoints={DEFAULT_LABEL_HALO_CONNECTION_POINTS}
        onPlacementCommit={onPlacementCommit}
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <HaloHost initialLabels={SAMPLE_LABELS} />,
};

export const EmptyRing: Story = {
  render: () => <HaloHost initialLabels={[]} />,
};

export const SingleLabel: Story = {
  render: () => (
    <HaloHost
      initialLabels={[
        {
          id: "solo",
          name: "Fine",
          color: "#94910a",
          shape: "classic",
          connectionPointId: "br",
          rotateDeg: 22,
        },
      ]}
    />
  ),
};

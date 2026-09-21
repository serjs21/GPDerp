"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  withMockAuthentication,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { LabelHalo } from "./LabelHalo";
import {
  DEFAULT_LABEL_HALO_CONNECTION_POINTS,
  type LabelHaloLabelItem,
  type LabelPlacement,
} from "./consts/labelHaloConsts";
import styles from "./LabelHalo.stories.module.css";

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
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [
    composeDecorators(withQueryClient, withMockAuthentication, withThemedStoryStage),
  ],
} satisfies Meta<typeof LabelHalo>;

export default meta;
type Story = StoryObj<typeof meta>;

function HaloLanternHost({
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
    <div className={styles.stage}>
      <div className={styles.host}>
        <LanternFrame ariaLabel="Haiku lantern with label halo">
          <Lantern
            haiku={makeMockHaiku({
              id: "lantern-label-halo",
              title: "Night questions",
              titleSuffix: 0,
              body: EXAMPLE_HAIKU_BODY,
              createdAt: STORY_CREATED_AT,
              labels: [],
            })}
          />
        </LanternFrame>
        <div className={styles.haloOverlay}>
          <LabelHalo
            labels={labels}
            connectionPoints={DEFAULT_LABEL_HALO_CONNECTION_POINTS}
            onPlacementCommit={onPlacementCommit}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <HaloLanternHost initialLabels={SAMPLE_LABELS} />,
};

export const EmptyRing: Story = {
  render: () => <HaloLanternHost initialLabels={[]} />,
};

export const SingleLabel: Story = {
  render: () => (
    <HaloLanternHost
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

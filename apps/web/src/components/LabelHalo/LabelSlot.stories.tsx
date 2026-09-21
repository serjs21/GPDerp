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
import { LabelSlot } from "./LabelSlot";
import type { LabelPlacement } from "./consts/labelHaloConsts";
import styles from "./LabelHalo.stories.module.css";

const meta = {
  title: "Haiku/LabelHalo/LabelSlot",
  component: LabelSlot,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [
    composeDecorators(withQueryClient, withMockAuthentication, withThemedStoryStage),
  ],
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

function SlotLanternHost({
  name,
  color,
  shape,
  connectionPointId,
  rotateDeg,
  showMeta,
}: {
  name: string;
  color: string;
  shape?: string;
  connectionPointId: string;
  rotateDeg: number;
  showMeta?: boolean;
}) {
  const [placement, setPlacement] = useState<LabelPlacement>({
    connectionPointId,
    rotateDeg,
  });

  return (
    <div className={styles.stage}>
      <div className={styles.host}>
        <LanternFrame ariaLabel="Haiku lantern with label slot">
          <Lantern
            haiku={makeMockHaiku({
              id: "lantern-label-slot",
              title: "Night questions",
              titleSuffix: 0,
              body: EXAMPLE_HAIKU_BODY,
              createdAt: STORY_CREATED_AT,
              labels: [],
            })}
          />
        </LanternFrame>
        <div className={styles.slotOverlay}>
          <LabelSlot
            id="story-slot"
            name={name}
            color={color}
            shape={shape}
            connectionPointId={placement.connectionPointId}
            rotateDeg={placement.rotateDeg}
            onPlacementCommit={setPlacement}
          />
        </div>
      </div>
      {showMeta ? (
        <p className={styles.meta}>
          point={placement.connectionPointId} rotate={Math.round(placement.rotateDeg)}°
          (drag arrows · commits on focus out)
        </p>
      ) : null}
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <SlotLanternHost
      name={args.name}
      color={args.color}
      shape={args.shape}
      connectionPointId={args.connectionPointId}
      rotateDeg={args.rotateDeg}
    />
  ),
};

export const Rotated: Story = {
  args: {
    rotateDeg: -22,
    connectionPointId: "bl",
  },
  render: (args) => (
    <SlotLanternHost
      name={args.name}
      color={args.color}
      shape={args.shape}
      connectionPointId={args.connectionPointId}
      rotateDeg={args.rotateDeg}
    />
  ),
};

export const Interactive: Story = {
  render: () => (
    <SlotLanternHost
      name="Pond"
      color="#13c2c2"
      shape="classic"
      connectionPointId="mr"
      rotateDeg={0}
      showMeta
    />
  ),
};

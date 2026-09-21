"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";
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
  seedPlacementFromConnectionPoint,
  type LabelHaloLabelItem,
  type LabelPlacement,
} from "./consts/labelHaloConsts";
import styles from "./LabelHalo.stories.module.css";

function labelFromPoint(
  partial: Omit<LabelHaloLabelItem, "xPercent" | "yPercent" | "connection"> & {
    pointId: "bl" | "ml" | "tl" | "tr" | "mr" | "br";
  },
): LabelHaloLabelItem {
  const seed = seedPlacementFromConnectionPoint(partial.pointId);
  return {
    id: partial.id,
    name: partial.name,
    color: partial.color,
    shape: partial.shape,
    rotateDeg: partial.rotateDeg,
    xPercent: seed.xPercent,
    yPercent: seed.yPercent,
    connection: seed.connection,
  };
}

const SAMPLE_LABELS: LabelHaloLabelItem[] = [
  labelFromPoint({
    id: "1",
    name: "Crow",
    color: "#fa541c",
    shape: "classic",
    pointId: "bl",
    rotateDeg: -22,
  }),
  labelFromPoint({
    id: "2",
    name: "Pond",
    color: "#13c2c2",
    shape: "classic",
    pointId: "mr",
    rotateDeg: 0,
  }),
  labelFromPoint({
    id: "3",
    name: "Autumn",
    color: "#faad14",
    shape: "classic",
    pointId: "tl",
    rotateDeg: 22,
  }),
];

const FIFTEEN_LABEL_SEEDS: Array<{
  name: string;
  color: string;
  xPercent: number;
  yPercent: number;
  rotateDeg: number;
}> = [
  // Captured from FifteenLabels drag session (debug snapshot).
  { name: "Crow", color: "#fa541c", xPercent: 10.7, yPercent: 68.18, rotateDeg: -18 },
  { name: "Pond", color: "#13c2c2", xPercent: 85.13, yPercent: 17.97, rotateDeg: -30.72 },
  { name: "Autumn", color: "#faad14", xPercent: 48.78, yPercent: 12.84, rotateDeg: 83.13 },
  { name: "Mist", color: "#597ef7", xPercent: 63.86, yPercent: 22.92, rotateDeg: -57.69 },
  { name: "Fine", color: "#94910a", xPercent: 75.93, yPercent: 67.5, rotateDeg: 4.04 },
  { name: "River", color: "#36cfc9", xPercent: 26.8, yPercent: 34.71, rotateDeg: -20.77 },
  { name: "Lantern", color: "#ff7a45", xPercent: 79.09, yPercent: 38.29, rotateDeg: -7.9 },
  { name: "Pine", color: "#389e0d", xPercent: 15.59, yPercent: 80.65, rotateDeg: 8.31 },
  { name: "Snow", color: "#adc6ff", xPercent: 90.88, yPercent: 86.8, rotateDeg: 6.64 },
  { name: "Ink", color: "#434343", xPercent: 7.4, yPercent: 17.8, rotateDeg: -2.13 },
  { name: "Moss", color: "#7cb305", xPercent: 11.57, yPercent: 48.03, rotateDeg: 13.06 },
  { name: "Tide", color: "#08979c", xPercent: 85.99, yPercent: 55.2, rotateDeg: -7.8 },
  { name: "Ember", color: "#d4380d", xPercent: 18.61, yPercent: 97.39, rotateDeg: -6 },
  { name: "Cloud", color: "#85a5ff", xPercent: 78.81, yPercent: 100, rotateDeg: 18 },
  { name: "Stone", color: "#8c8c8c", xPercent: 26.65, yPercent: 4.65, rotateDeg: 44.33 },
];

const FIFTEEN_LABELS: LabelHaloLabelItem[] = FIFTEEN_LABEL_SEEDS.map((seed, index) => ({
  id: `crowd-${index + 1}`,
  name: seed.name,
  color: seed.color,
  shape: "classic",
  xPercent: seed.xPercent,
  yPercent: seed.yPercent,
  rotateDeg: seed.rotateDeg,
  connection: seed.xPercent < 50 ? "end" : "start",
}));

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
  captureLocations = false,
}: {
  initialLabels: LabelHaloLabelItem[];
  /** When true, emit debug location snapshots after each placement commit. */
  captureLocations?: boolean;
}) {
  const [labels, setLabels] = useState(initialLabels);
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  const onPlacementCommit = (labelId: string, placement: LabelPlacement) => {
    setLabels((current) => {
      const next = current.map((label) =>
        label.id === labelId
          ? {
              ...label,
              xPercent: placement.xPercent,
              yPercent: placement.yPercent,
              rotateDeg: placement.rotateDeg,
            }
          : label,
      );
      // #region agent log
      if (captureLocations) {
        const moved = next.find((label) => label.id === labelId);
        fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "ab780c",
          },
          body: JSON.stringify({
            sessionId: "ab780c",
            runId: "fifteen-locations",
            hypothesisId: "LOC",
            location: "LabelHalo.stories.tsx:onPlacementCommit",
            message: "label placement",
            data: {
              labelId,
              name: moved?.name ?? null,
              xPercent: placement.xPercent,
              yPercent: placement.yPercent,
              rotateDeg: placement.rotateDeg,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "ab780c",
          },
          body: JSON.stringify({
            sessionId: "ab780c",
            runId: "fifteen-locations",
            hypothesisId: "LOC",
            location: "LabelHalo.stories.tsx:snapshot",
            message: "all label locations",
            data: {
              labels: next.map((label) => ({
                id: label.id,
                name: label.name,
                color: label.color,
                xPercent: label.xPercent,
                yPercent: label.yPercent,
                rotateDeg: label.rotateDeg,
              })),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
      // #endregion
      return next;
    });
  };

  useEffect(() => {
    if (!captureLocations) return;
    // #region agent log
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "ab780c",
      },
      body: JSON.stringify({
        sessionId: "ab780c",
        runId: "fifteen-locations-verify",
        hypothesisId: "LOC",
        location: "LabelHalo.stories.tsx:mount",
        message: "fifteen labels mount",
        data: {
          labels: labelsRef.current.map((label) => ({
            id: label.id,
            name: label.name,
            color: label.color,
            xPercent: label.xPercent,
            yPercent: label.yPercent,
            rotateDeg: label.rotateDeg,
          })),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [captureLocations]);

  return (
    <div className={styles.stage}>
      <div className={styles.host}>
        <LabelHalo labels={labels} onPlacementCommit={onPlacementCommit}>
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
        </LabelHalo>
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
        labelFromPoint({
          id: "solo",
          name: "Fine",
          color: "#94910a",
          shape: "classic",
          pointId: "br",
          rotateDeg: 22,
        }),
      ]}
    />
  ),
};

export const FifteenLabels: Story = {
  render: () => (
    <HaloLanternHost initialLabels={FIFTEEN_LABELS} captureLocations />
  ),
};

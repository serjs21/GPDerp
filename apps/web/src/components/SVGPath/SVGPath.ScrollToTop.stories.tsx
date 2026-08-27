"use client";

import { useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/StyledComponents";
import {
  SVGPath,
  type SVGPathHandle,
  SCROLL_TO_TOP_HANDOFF_INDEX,
  SCROLL_TO_TOP_NEAR_THRESHOLD,
  isScrollToTopNear,
} from "@/components/SVGPath";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { EXAMPLE_HAIKU_BODY, makeMockHaiku, WISDOM_FOREST_BODIES } from "@/storybook";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import styles from "./SVGPath.ScrollToTop.stories.module.css";

const MOCK_HAIKU_COUNT = 30;

const MOCK_HAIKUS = Array.from({ length: MOCK_HAIKU_COUNT }, (_, index) =>
  makeMockHaiku({
    id: `svg-path-scroll-top-${index}`,
    title: `Lantern ${index + 1}`,
    body: WISDOM_FOREST_BODIES[index % WISDOM_FOREST_BODIES.length] ?? EXAMPLE_HAIKU_BODY,
  }),
);

const meta = {
  title: "Haiku/SVGPath/ScrollToTop",
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  decorators: [withLoggedInAppLayout],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function ScrollToTopDemo({
  initialFocusIndex,
  remountKey,
}: {
  initialFocusIndex: number;
  remountKey?: string | number;
}): ReactNode {
  const pathRef = useRef<SVGPathHandle>(null);
  const [focusIndex, setFocusIndex] = useState(initialFocusIndex);
  const mode = isScrollToTopNear(focusIndex) ? "near" : "far";

  return (
    <div className={styles.stage}>
      <div className={styles.toolbar}>
        <Button type="primary" onClick={() => pathRef.current?.scrollToTop()}>
          Scroll to top
        </Button>
        <p className={styles.readout}>
          focus {focusIndex} · mode {mode} · threshold {SCROLL_TO_TOP_NEAR_THRESHOLD} ·
          handoff {SCROLL_TO_TOP_HANDOFF_INDEX}
        </p>
      </div>
      <SVGPath
        key={remountKey ?? `focus-${initialFocusIndex}`}
        ref={pathRef}
        haikus={MOCK_HAIKUS}
        initialFocusIndex={initialFocusIndex}
        showGuides
        onFocusChange={setFocusIndex}
      />
    </div>
  );
}

export const NearAt3: Story = {
  name: "Near · focus 3",
  render: () => <ScrollToTopDemo initialFocusIndex={3} />,
};

export const NearAtThreshold: Story = {
  name: "Near · focus 10 (threshold)",
  render: () => <ScrollToTopDemo initialFocusIndex={10} />,
};

export const FarAt15: Story = {
  name: "Far · focus 15",
  render: () => <ScrollToTopDemo initialFocusIndex={15} />,
};

export const FarAt25: Story = {
  name: "Far · focus 25",
  render: () => <ScrollToTopDemo initialFocusIndex={25} />,
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [startFocus, setStartFocus] = useState(15);
    const [mountKey, setMountKey] = useState(0);
    const clamped = Math.max(0, Math.min(MOCK_HAIKU_COUNT - 1, startFocus));

    return (
      <>
        <div className={`${styles.toolbar} ${styles.interactiveToolbar}`}>
          <label className={styles.focusControl}>
            Start focus
            <input
              type="number"
              min={0}
              max={MOCK_HAIKU_COUNT - 1}
              value={startFocus}
              onChange={(event) => setStartFocus(Number(event.target.value) || 0)}
            />
          </label>
          <Button type="default" onClick={() => setMountKey((key) => key + 1)}>
            Remount at focus
          </Button>
        </div>
        <ScrollToTopDemo key={mountKey} remountKey={mountKey} initialFocusIndex={clamped} />
      </>
    );
  },
};

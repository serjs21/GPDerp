"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { Lantern } from "./Lantern";
import {
  getLanternQueuePathProgress,
  LANTERN_FLIGHT_PATH_INITIAL,
  sampleLanternFlightPath,
} from "./lanternFlightPath";
import styles from "./Lantern.stories.module.css";

const meta: Meta<typeof Lantern> = {
  title: "Haiku/Lantern",
  component: Lantern,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
};

export default meta;
type Story = StoryObj<typeof Lantern>;

const WRITTEN_HAIKUS = [
  {
    id: "written-1",
    title: "Empty pond",
    body: `Old pond—
a frog jumps in,
water's sound.`,
  },
  {
    id: "written-2",
    title: "Summer grass",
    body: `Summer grasses—
all that remains
of warriors' dreams.`,
  },
  {
    id: "written-3",
    title: "Autumn eve",
    body: `On a withered branch
a crow has settled—
autumn evening.`,
  },
  {
    id: "written-4",
    title: "Moon road",
    body: `The moon is the road
home—lanterns rise
into the blue dark.`,
  },
  {
    id: "written-5",
    title: "First snow",
    body: `First snow—
the village temple bell
softens the night.`,
  },
] as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function queueSpacingForCount(lanternCount: number): number {
  return 1 / Math.max(1, lanternCount);
}

type FlightPathArgs = {
  lanternCount: number;
};

function FlightPathDemo({ lanternCount }: FlightPathArgs) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const spacing = queueSpacingForCount(lanternCount);

  const lanterns = useMemo(
    () =>
      Array.from({ length: lanternCount }, (_, index) => {
        const haiku = WRITTEN_HAIKUS[index % WRITTEN_HAIKUS.length];
        return {
          id: `${haiku.id}-${index}`,
          title: haiku.title,
          body: haiku.body,
        };
      }),
    [lanternCount],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setScrollProgress((progress) => clamp01(progress + event.deltaY * 0.0008));
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  const activeIndex = lanterns.findIndex((_, index) => {
    const pathS = getLanternQueuePathProgress(scrollProgress, index, spacing);
    return pathS >= LANTERN_FLIGHT_PATH_INITIAL - 0.02 && pathS <= LANTERN_FLIGHT_PATH_INITIAL + 0.06;
  });

  return (
    <div ref={stageRef} className={styles.flightPathViewport}>
      <p className={styles.flightPathHud}>
        scroll {(scrollProgress * 100).toFixed(0)}%
        {activeIndex >= 0 ? ` · active #${activeIndex + 1}` : ""}
      </p>
      <div className={styles.flightPathStage} aria-label="Lantern flight path">
        {[...lanterns]
          .map((item, index) => ({
            item,
            index,
            pathS: getLanternQueuePathProgress(scrollProgress, index, spacing),
          }))
          .sort(
            (a, b) =>
              sampleLanternFlightPath(a.pathS).scale - sampleLanternFlightPath(b.pathS).scale,
          )
          .map(({ item, pathS }) => (
            <Lantern
              key={item.id}
              className={styles.flightPathLantern}
              progress={pathS}
              haiku={makeMockHaiku({
                id: item.id,
                title: item.title,
                body: item.body,
              })}
            />
          ))}
      </div>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className={styles.stage}>
      <Lantern {...args} />
    </div>
  ),
  args: {
    haiku: makeMockHaiku({
      id: "lantern-default",
      title: "Night questions",
      body: EXAMPLE_HAIKU_BODY,
    }),
  },
};

export const FlightPath: StoryObj<FlightPathArgs> = {
  name: "Flight path",
  parameters: { wideContent: true },
  argTypes: {
    lanternCount: { control: { type: "range", min: 1, max: 12, step: 1 } },
  },
  args: { lanternCount: 5 },
  render: ({ lanternCount }) => <FlightPathDemo lanternCount={lanternCount} />,
};

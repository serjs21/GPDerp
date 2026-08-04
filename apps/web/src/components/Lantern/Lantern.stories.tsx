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
  isLanternFlightPathVisible,
  sampleLanternFlightPath,
} from "./lanternFlightPath";
import { lanternFlightPathStops } from "./lanternFlightPathStops.config";
import { pointAtFlightArcLength } from "./lanternFlightPathSvg";
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
    return pathS >= -0.02 && pathS <= 0.06;
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
          .filter(({ pathS }) => isLanternFlightPathVisible(pathS))
          .sort(
            (a, b) =>
              sampleLanternFlightPath(a.pathS).scale - sampleLanternFlightPath(b.pathS).scale,
          )
          .map(({ item, index, pathS }) => {
            const nextPathS =
              index < lanterns.length - 1
                ? getLanternQueuePathProgress(scrollProgress, index + 1, spacing)
                : undefined;

            return (
              <Lantern
                key={item.id}
                className={styles.flightPathLantern}
                progress={pathS}
                nextLanternPathProgress={nextPathS}
                haiku={makeMockHaiku({
                  id: item.id,
                  title: item.title,
                  body: item.body,
                })}
              />
            );
          })}
      </div>
    </div>
  );
}

type FlightPathStopCarouselArgs = {
  stopCount: number;
};

function FlightPathStopCarouselDemo({ stopCount }: FlightPathStopCarouselArgs) {
  const [stepIndex, setStepIndex] = useState(0);
  const stops = useMemo(() => lanternFlightPathStops(stopCount), [stopCount]);
  const maxIndex = stops.length - 1;
  const pathS = stops[Math.min(stepIndex, maxIndex)] ?? 0;
  const activeStepIndex = Math.min(stepIndex, maxIndex);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setStepIndex((index) => Math.max(0, index - 1));
      }
      if (event.key === "ArrowRight") {
        setStepIndex((index) => Math.min(maxIndex, index + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [maxIndex]);

  return (
    <div className={styles.flightPathViewport}>
      <p className={styles.flightPathHud}>
        stop {activeStepIndex + 1} / {stops.length} · pathS {pathS.toFixed(3)}
      </p>
      <div className={styles.flightPathStage} aria-label="Lantern flight path stops">
        {/* eslint-disable-next-line @next/next/no-img-element -- storybook path guide from public SVG */}
        <img className={styles.flightPathGuide} src="/flight_path.svg" alt="" aria-hidden />
        {stops.map((stopPathS, index) => {
          const point = pointAtFlightArcLength(stopPathS);
          return (
            <span
              key={index}
              className={`${styles.flightPathStop} ${index === activeStepIndex ? styles.flightPathStopActive : ""}`}
              style={{
                left: `${point.x * 100}%`,
                top: `${point.y * 100}%`,
              }}
              aria-hidden
            />
          );
        })}
        <Lantern
          className={`${styles.flightPathLantern} ${styles.flightPathStopLantern}`}
          progress={pathS}
          haiku={makeMockHaiku({
            id: "flight-path-stop-lantern",
            title: "Empty pond",
            body: WRITTEN_HAIKUS[0].body,
          })}
        />
      </div>
      <div className={styles.flightPathControls}>
        <button
          type="button"
          className={styles.flightPathControlButton}
          aria-label="Previous stop"
          disabled={activeStepIndex <= 0}
          onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
        >
          ←
        </button>
        <span className={styles.flightPathControlLabel}>
          {activeStepIndex + 1} / {stops.length}
        </span>
        <button
          type="button"
          className={styles.flightPathControlButton}
          aria-label="Next stop"
          disabled={activeStepIndex >= maxIndex}
          onClick={() => setStepIndex((index) => Math.min(maxIndex, index + 1))}
        >
          →
        </button>
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

export const FlightPathStops: StoryObj<FlightPathStopCarouselArgs> = {
  name: "Flight path stops",
  parameters: { wideContent: true },
  argTypes: {
    stopCount: { control: { type: "range", min: 3, max: 12, step: 1 } },
  },
  args: { stopCount: 7 },
  render: ({ stopCount }) => (
    <FlightPathStopCarouselDemo key={stopCount} stopCount={stopCount} />
  ),
};

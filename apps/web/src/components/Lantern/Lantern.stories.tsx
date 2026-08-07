"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  getLanternJourneyTransform,
  isLanternFlightPathVisible,
  isLanternJourneyVisible,
  journeySForCarouselStep,
  lanternInitialJourneyS,
  lanternInitialPathS,
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  resolveLanternQueueSlot,
  routeStopById,
} from "./lanternFlightPath";
import { easeInOutCubic } from "./lanternTransform";
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

const CAROUSEL_TRANSITION_MS = 320;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type FlightPathArgs = {
  lanternCount: number;
};

function FlightPathGuideBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.flightPathGuideBox, className].filter(Boolean).join(" ")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- storybook route guide from public SVG */}
      <img src="/route-split-segments-exact.svg" alt="" aria-hidden />
      {children}
    </div>
  );
}

function FlightPathDemo({ lanternCount }: FlightPathArgs) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lanterns = Array.from({ length: lanternCount }, (_, index) => {
    const haiku = WRITTEN_HAIKUS[index % WRITTEN_HAIKUS.length];
    return {
      id: `${haiku.id}-${index}`,
      title: haiku.title,
      body: haiku.body,
    };
  });

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
    const slot = resolveLanternQueueSlot(scrollProgress, index, lanternCount);
    if (slot.journeyS !== undefined) {
      return slot.journeyS <= lanternInitialJourneyS() + 0.02;
    }
    return (
      (slot.pathS ?? lanternInitialPathS()) >= lanternInitialPathS() - 0.02 &&
      (slot.pathS ?? lanternInitialPathS()) <= lanternInitialPathS() + 0.06
    );
  });

  return (
    <div ref={stageRef} className={styles.flightPathViewport}>
      <p className={styles.flightPathHud}>
        scroll {(scrollProgress * 100).toFixed(0)}%
        {activeIndex >= 0 ? ` · active #${activeIndex + 1}` : ""}
      </p>
      <div className={styles.flightPathStage} aria-label="Lantern flight path">
        <FlightPathGuideBox>
          {[...lanterns]
            .map((item, index) => ({
              item,
              index,
              slot: resolveLanternQueueSlot(scrollProgress, index, lanternCount),
            }))
            .filter(({ slot }) =>
              slot.journeyS !== undefined
                ? isLanternJourneyVisible(slot.journeyS)
                : isLanternFlightPathVisible(slot.pathS ?? lanternInitialPathS()),
            )
            .sort((a, b) => {
              const aValue = a.slot.pathS ?? a.slot.journeyS ?? 0;
              const bValue = b.slot.pathS ?? b.slot.journeyS ?? 0;
              return aValue - bValue;
            })
            .map(({ item, index, slot }) => {
              const nextSlot =
                index < lanterns.length - 1
                  ? resolveLanternQueueSlot(scrollProgress, index + 1, lanternCount)
                  : undefined;

              return (
                <Lantern
                  key={item.id}
                  className={styles.flightPathLantern}
                  journeyS={slot.journeyS}
                  progress={slot.pathS}
                  nextLanternPathProgress={nextSlot?.pathS ?? nextSlot?.journeyS}
                  haiku={makeMockHaiku({
                    id: item.id,
                    title: item.title,
                    body: item.body,
                  })}
                />
              );
            })}
        </FlightPathGuideBox>
      </div>
    </div>
  );
}

function FlightPathStopCarouselDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [journeyS, setJourneyS] = useState(() => journeySForCarouselStep(0));
  const animationRef = useRef<number | null>(null);
  const journeySRef = useRef(journeyS);
  const stepIndexRef = useRef(stepIndex);
  const goToStepRef = useRef<(nextIndex: number) => void>(() => {});
  journeySRef.current = journeyS;
  stepIndexRef.current = stepIndex;
  const stopIds = LANTERN_CAROUSEL_STOP_IDS;
  const maxIndex = stopIds.length - 1;
  const activeStepIndex = Math.min(stepIndex, maxIndex);
  const activeStopId = stopIds[activeStepIndex] ?? LANTERN_FLIGHT_PATH_INITIAL_STOP_ID;
  const lanternTransform = getLanternJourneyTransform(journeyS);
  const exitStop = routeStopById(LANTERN_FLIGHT_PATH_EXIT_STOP_ID);
  const initialStop = routeStopById(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);

  const goToStep = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(maxIndex, nextIndex));
    const atRest = animationRef.current === null;
    if (clamped === stepIndexRef.current && atRest) return;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const fromJourneyS = journeySRef.current;
    const toJourneyS = journeySForCarouselStep(clamped);
    setStepIndex(clamped);

    const start = performance.now();
    const tick = (now: number) => {
      const linearT = clamp01((now - start) / CAROUSEL_TRANSITION_MS);
      const easedT = easeInOutCubic(linearT);
      const nextJourneyS = fromJourneyS + (toJourneyS - fromJourneyS) * easedT;
      journeySRef.current = nextJourneyS;
      setJourneyS(nextJourneyS);
      if (linearT < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
        journeySRef.current = toJourneyS;
        setJourneyS(toJourneyS);
      }
    };

    animationRef.current = requestAnimationFrame(tick);
  };

  goToStepRef.current = goToStep;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToStepRef.current(stepIndexRef.current - 1);
      }
      if (event.key === "ArrowRight") {
        goToStepRef.current(stepIndexRef.current + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.flightPathViewport}>
      <p className={styles.flightPathHud}>
        stop-{activeStopId} · journeyS {journeyS.toFixed(3)} · scale {lanternTransform.scale.toFixed(2)}
      </p>
      <div className={styles.flightPathStage} aria-label="Lantern flight path stops">
        <FlightPathGuideBox>
          {exitStop ? (
            <span
              className={`${styles.flightPathStopLabel} ${styles.flightPathStopLabelExit}`}
              style={{
                left: `${exitStop.x * 100}%`,
                top: `${exitStop.y * 100}%`,
              }}
              aria-hidden
            >
              0
            </span>
          ) : null}
          {initialStop ? (
            <span
              className={`${styles.flightPathStopLabel} ${styles.flightPathStopLabelInitial}`}
              style={{
                left: `${initialStop.x * 100}%`,
                top: `${initialStop.y * 100}%`,
              }}
              aria-hidden
            >
              1
            </span>
          ) : null}
          <Lantern
            className={`${styles.flightPathLantern} ${styles.flightPathStopLantern}`}
            journeyS={journeyS}
            haiku={makeMockHaiku({
              id: "flight-path-stop-lantern",
              title: "Empty pond",
              body: WRITTEN_HAIKUS[0].body,
            })}
          />
          <span
            className={`${styles.flightPathStop} ${styles.flightPathStopActive}`}
            style={{
              left: `${lanternTransform.x * 100}%`,
              top: `${lanternTransform.y * 100}%`,
            }}
            aria-hidden
          />
        </FlightPathGuideBox>
      </div>
      <div className={styles.flightPathControls}>
        <button
          type="button"
          className={styles.flightPathControlButton}
          aria-label="Previous stop"
          disabled={activeStepIndex <= 0}
          onClick={() => goToStep(stepIndex - 1)}
        >
          ←
        </button>
        <span className={styles.flightPathControlLabel}>
          stop-{activeStopId} ({activeStepIndex + 1} / {stopIds.length})
        </span>
        <button
          type="button"
          className={styles.flightPathControlButton}
          aria-label="Next stop"
          disabled={activeStepIndex >= maxIndex}
          onClick={() => goToStep(stepIndex + 1)}
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

export const FlightPathStops: Story = {
  name: "Flight path stops",
  parameters: { wideContent: true },
  render: () => <FlightPathStopCarouselDemo />,
};

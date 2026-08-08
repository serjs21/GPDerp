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
  applyCarouselScrollDelta,
  getLanternJourneyTransform,
  isLanternFlightPathVisible,
  isLanternJourneyVisible,
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  lanternInitialJourneyS,
  lanternInitialPathS,
  resolveCarouselQueueSlots,
  routeStopById,
} from "./lanternFlightPath";
import {
  buildCarouselLanternJourneyS,
  clampCarouselStepIndex,
  getCarouselStepBounds,
  isCarouselLanternVisibleAtStep,
} from "./lanternCarouselSteps";
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

const CAROUSEL_TRANSITION_MS = 500;

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
  const [scrollState, setScrollState] = useState({ scrollProgress: 0, pushedOutCount: 0 });
  const { scrollProgress, pushedOutCount } = scrollState;

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
      setScrollState((state) =>
        applyCarouselScrollDelta(state, lanternCount, event.deltaY * 0.0008),
      );
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [lanternCount]);

  const queueSlots = resolveCarouselQueueSlots(scrollProgress, lanternCount, pushedOutCount);

  const activeIndex = queueSlots.findIndex(({ slot }) => {
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
        {pushedOutCount > 0 ? ` · pushed ${pushedOutCount}` : ""}
        {activeIndex >= 0 ? ` · active #${queueSlots[activeIndex]?.index ?? activeIndex + 1}` : ""}
      </p>
      <div className={styles.flightPathStage} aria-label="Lantern flight path">
        <FlightPathGuideBox>
          {queueSlots
            .map(({ index, slot }) => ({
              item: lanterns[index],
              index,
              slot,
            }))
            .filter(
              ({ item, slot }) =>
                item !== undefined &&
                (slot.journeyS !== undefined
                  ? isLanternJourneyVisible(slot.journeyS)
                  : isLanternFlightPathVisible(slot.pathS ?? lanternInitialPathS())),
            )
            .sort((a, b) => {
              const aValue = a.slot.pathS ?? a.slot.journeyS ?? 0;
              const bValue = b.slot.pathS ?? b.slot.journeyS ?? 0;
              return aValue - bValue;
            })
            .map(({ item, index, slot }) => {
              const nextEntry = queueSlots.find((entry) => entry.index === index + 1);
              const nextSlot = nextEntry?.slot;

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

function FlightPathStopCarouselDemo({ lanternCount }: FlightPathArgs) {
  const { minStepIndex, maxStepIndex } = getCarouselStepBounds(lanternCount);
  const [stepIndex, setStepIndex] = useState(maxStepIndex);
  const [lanternJourneyS, setLanternJourneyS] = useState(() =>
    buildCarouselLanternJourneyS(maxStepIndex, lanternCount),
  );
  const animationRef = useRef<number | null>(null);
  const journeySRef = useRef(lanternJourneyS);
  const stepIndexRef = useRef(stepIndex);
  const goToStepRef = useRef<(nextIndex: number) => void>(() => {});
  journeySRef.current = lanternJourneyS;
  stepIndexRef.current = stepIndex;
  const stopIds = LANTERN_CAROUSEL_STOP_IDS;
  const activeStepIndex = Math.min(stepIndex, maxStepIndex);
  const activeStopId = stopIds[activeStepIndex] ?? LANTERN_FLIGHT_PATH_INITIAL_STOP_ID;
  const leadJourneyS = lanternJourneyS[0] ?? buildCarouselLanternJourneyS(activeStepIndex, lanternCount)[0];
  const lanternTransform = getLanternJourneyTransform(leadJourneyS ?? 0);
  const exitStop = routeStopById(LANTERN_FLIGHT_PATH_EXIT_STOP_ID);
  const initialStop = routeStopById(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);

  const goToStep = (nextIndex: number) => {
    const clamped = clampCarouselStepIndex(nextIndex, lanternCount);
    const atRest = animationRef.current === null;
    if (clamped === stepIndexRef.current && atRest) return;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const fromValues = [...journeySRef.current];
    const toValues = buildCarouselLanternJourneyS(clamped, lanternCount);
    setStepIndex(clamped);

    const start = performance.now();
    const tick = (now: number) => {
      const linearT = clamp01((now - start) / CAROUSEL_TRANSITION_MS);
      const easedT = easeInOutCubic(linearT);
      const nextValues = fromValues.map((from, offset) => {
        const to = toValues[offset] ?? from;
        return from + (to - from) * easedT;
      });
      journeySRef.current = nextValues;
      setLanternJourneyS(nextValues);
      if (linearT < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
        journeySRef.current = toValues;
        setLanternJourneyS(toValues);
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
        stop-{activeStopId} · journeyS {leadJourneyS.toFixed(3)} · scale{" "}
        {lanternTransform.scale.toFixed(2)}
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
          {Array.from({ length: lanternCount }, (_, offset) => {
              if (!isCarouselLanternVisibleAtStep(stepIndex, offset)) return null;

              const slotJourneyS = lanternJourneyS[offset];
              if (slotJourneyS === undefined || !isLanternJourneyVisible(slotJourneyS)) return null;

              const haiku = WRITTEN_HAIKUS[offset % WRITTEN_HAIKUS.length];
              return (
                <Lantern
                  key={`carousel-lantern-${offset}`}
                  className={`${styles.flightPathLantern} ${styles.flightPathStopLantern}`}
                  journeyS={slotJourneyS}
                  haiku={makeMockHaiku({
                    id: `flight-path-stop-lantern-${offset}`,
                    title: haiku.title,
                    body: haiku.body,
                  })}
                />
              );
            })}
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
          disabled={activeStepIndex <= minStepIndex}
          onClick={() => goToStep(stepIndex - 1)}
        >
          ←
        </button>
        <span className={styles.flightPathControlLabel}>
          stop-{activeStopId} ({activeStepIndex - minStepIndex + 1} / {maxStepIndex - minStepIndex + 1})
        </span>
        <button
          type="button"
          className={styles.flightPathControlButton}
          aria-label="Next stop"
          disabled={activeStepIndex >= maxStepIndex}
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

export const FlightPathStops: StoryObj<FlightPathArgs> = {
  name: "Flight path stops",
  parameters: { wideContent: true },
  argTypes: {
    lanternCount: { control: { type: "range", min: 1, max: 5, step: 1 } },
  },
  args: { lanternCount: 3 },
  render: ({ lanternCount }) => (
    <FlightPathStopCarouselDemo key={lanternCount} lanternCount={lanternCount} />
  ),
};

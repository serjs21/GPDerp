"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";
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
  isLanternJourneyVisible,
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_REST_EPSILON,
  lanternInitialJourneyS,
  lanternInitialPathS,
  routeStopById,
} from "./lanternFlightPath";
import {
  createLanternQueueScrollState,
  isLanternQueueSlotVisible,
  requestLanternQueueScrollStep,
  resolveAnimatedQueueSlots,
  tickLanternQueueAnimation,
  type AnimatedLanternQueueSlot,
  type LanternQueueScrollState,
} from "./lanternQueueExitAnimation";
import { resolveLanternTransform } from "./lanternTransform";
import {
  buildCarouselLanternJourneyS,
  getCarouselStepBounds,
  isCarouselLanternVisibleAtStep,
} from "./lanternCarouselSteps";
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

function renderLanternExitSlot(
  slot: AnimatedLanternQueueSlot,
  className: string,
  haiku: { id: string; title: string; body: string },
  key: string,
) {
  return (
    <Lantern
      key={key}
      className={className}
      journeyS={slot.transform ? undefined : slot.journeyS}
      progress={slot.pathS !== undefined ? slot.pathS : undefined}
      transform={slot.transform}
      haiku={makeMockHaiku({
        id: haiku.id,
        title: haiku.title,
        body: haiku.body,
      })}
    />
  );
}

function useLanternQueueAnimationLoop(
  state: LanternQueueScrollState,
  setState: (next: LanternQueueScrollState) => void,
  stateRef: MutableRefObject<LanternQueueScrollState>,
  options: {
    onPhaseIdle?: (completed: LanternQueueScrollState) => LanternQueueScrollState;
    onSample?: (next: LanternQueueScrollState) => void;
  } = {},
) {
  const onPhaseIdleRef = useRef(options.onPhaseIdle);
  const onSampleRef = useRef(options.onSample);
  onPhaseIdleRef.current = options.onPhaseIdle;
  onSampleRef.current = options.onSample;

  useEffect(() => {
    if (state.phase === "idle" || state.animStartTime === null) {
      return;
    }

    let raf = 0;
    const tick = (now: number) => {
      const prev = stateRef.current;
      let next = tickLanternQueueAnimation(prev, now);

      if (next.phase === "idle" && prev.phase !== "idle") {
        next = onPhaseIdleRef.current?.(next) ?? next;
      }

      stateRef.current = next;
      setState(next);
      onSampleRef.current?.(next);

      if (next.phase !== "idle") {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [setState, state.animStartTime, state.phase, stateRef]);
}

function FlightPathDemo({ lanternCount }: FlightPathArgs) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<LanternQueueScrollState>(() =>
    createLanternQueueScrollState(),
  );
  const scrollStateRef = useRef(scrollState);
  const lastSampledMilestoneRef = useRef(-1);
  scrollStateRef.current = scrollState;
  const { fadeProgress, pushedOutCount, phase } = scrollState;

  const lanterns = Array.from({ length: lanternCount }, (_, index) => {
    const haiku = WRITTEN_HAIKUS[index % WRITTEN_HAIKUS.length];
    return {
      id: `${haiku.id}-${index}`,
      title: haiku.title,
      body: haiku.body,
    };
  });

  useLanternQueueAnimationLoop(scrollState, setScrollState, scrollStateRef, {
    onSample: (next) => {
      if (next.phase === "idle") {
        lastSampledMilestoneRef.current = -1;
        return;
      }

      const milestone = Math.floor(next.phaseT * 4);
      if (milestone === lastSampledMilestoneRef.current) return;
      lastSampledMilestoneRef.current = milestone;

      const slots = resolveAnimatedQueueSlots(next, lanternCount);
      const newest = slots.at(-1);
      const resolved = newest
        ? resolveLanternTransform({
            progress: newest.slot.transform ? undefined : newest.slot.pathS,
            journeyS: newest.slot.journeyS,
            transform: newest.slot.transform,
          })
        : null;

      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
        body: JSON.stringify({
          sessionId: "a4f3b7",
          runId: "segment0-fix",
          hypothesisId: "H6",
          location: "Lantern.stories.tsx:FlightPathDemo",
          message: "queue animation sample",
          data: {
            phase: next.phase,
            phaseT: next.phaseT,
            pathS: newest?.slot.pathS,
            journeyS: newest?.slot.journeyS,
            x: resolved?.x,
            y: resolved?.y,
            opacity: resolved?.opacity,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    },
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      const next = requestLanternQueueScrollStep(
        scrollStateRef.current,
        direction,
        lanternCount,
        performance.now(),
      );

      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
        body: JSON.stringify({
          sessionId: "a4f3b7",
          runId: "segment0-fix",
          hypothesisId: "H1",
          location: "Lantern.stories.tsx:onWheel",
          message: "queue scroll step requested",
          data: {
            direction,
            fromPhase: scrollStateRef.current.phase,
            toPhase: next.phase,
            fadeProgress: next.fadeProgress,
            pushedOutCount: next.pushedOutCount,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      if (next.phase === scrollStateRef.current.phase && next.phase === "idle") {
        return;
      }

      scrollStateRef.current = next;
      setScrollState(next);
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
    };
  }, [lanternCount]);

  const queueSlots = resolveAnimatedQueueSlots(scrollState, lanternCount);

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
        {phase !== "idle" ? `${phase} ${(scrollState.phaseT * 100).toFixed(0)}%` : `fade ${(fadeProgress * 100).toFixed(0)}%`}
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
                item !== undefined && isLanternQueueSlotVisible(slot, phase),
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
                  className={`${styles.flightPathLantern} ${styles.flightPathStopLantern}`}
                  journeyS={slot.transform ? undefined : slot.journeyS}
                  progress={slot.pathS !== undefined ? slot.pathS : undefined}
                  transform={slot.transform}
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
  const [queueState, setQueueState] = useState<LanternQueueScrollState>(() =>
    createLanternQueueScrollState(),
  );
  const [exitingOffset, setExitingOffset] = useState<number | null>(null);
  const [enteringOffset, setEnteringOffset] = useState<number | null>(null);
  const exitingOffsetRef = useRef<number | null>(null);
  const enteringOffsetRef = useRef<number | null>(null);
  const queueVisibleCountRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const journeySRef = useRef(lanternJourneyS);
  const stepIndexRef = useRef(stepIndex);
  const queueStateRef = useRef(queueState);
  const goToStepRef = useRef<(nextIndex: number) => void>(() => {});
  journeySRef.current = lanternJourneyS;
  stepIndexRef.current = stepIndex;
  queueStateRef.current = queueState;
  exitingOffsetRef.current = exitingOffset;
  enteringOffsetRef.current = enteringOffset;
  const stopIds = LANTERN_CAROUSEL_STOP_IDS;
  const activeStepIndex = Math.min(stepIndex, maxStepIndex);
  const activeStopId = stopIds[activeStepIndex] ?? LANTERN_FLIGHT_PATH_INITIAL_STOP_ID;
  const leadJourneyS = lanternJourneyS[0] ?? buildCarouselLanternJourneyS(activeStepIndex, lanternCount)[0];
  const lanternTransform = getLanternJourneyTransform(leadJourneyS ?? 0);
  const exitStop = routeStopById(LANTERN_FLIGHT_PATH_EXIT_STOP_ID);
  const initialStop = routeStopById(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);
  const lanternClassName = `${styles.flightPathLantern} ${styles.flightPathStopLantern}`;
  const queueAnimating = exitingOffset !== null || enteringOffset !== null;
  const restingAtExit =
    queueState.phase === "idle" &&
    queueState.fadeProgress >= 1 - LANTERN_FLIGHT_PATH_REST_EPSILON;
  const queueVisibleCount = queueAnimating ? queueVisibleCountRef.current : stepIndex + 1;

  const getCarouselQueueSlot = (offset: number): AnimatedLanternQueueSlot | null => {
    const useQueueSlots = queueAnimating || restingAtExit;
    if (!useQueueSlots) return null;
    const visibleCount = queueAnimating ? queueVisibleCountRef.current : stepIndex + 1;
    const slots = resolveAnimatedQueueSlots(queueState, visibleCount);
    return slots.find((entry) => entry.index === offset)?.slot ?? null;
  };

  useLanternQueueAnimationLoop(queueState, setQueueState, queueStateRef, {
    onPhaseIdle: (completed) => {
      if (exitingOffsetRef.current !== null) {
        if (completed.pushedOutCount > 0) {
          const nextStep = Math.max(minStepIndex, stepIndexRef.current - 1);
          const nextJourney = buildCarouselLanternJourneyS(nextStep, lanternCount);
          setStepIndex(nextStep);
          setLanternJourneyS(nextJourney);
          journeySRef.current = nextJourney;
          stepIndexRef.current = nextStep;
          setExitingOffset(null);
          exitingOffsetRef.current = null;
          // #region agent log
          fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
            body: JSON.stringify({
              sessionId: "a4f3b7",
              runId: "two-phase-exit",
              hypothesisId: "H1",
              location: "Lantern.stories.tsx:onPhaseIdle",
              message: "pushOut complete — step decremented",
              data: { nextStep, fadeProgress: 0 },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          return createLanternQueueScrollState();
        }

        if (completed.fadeProgress >= 1 - LANTERN_FLIGHT_PATH_REST_EPSILON) {
          setExitingOffset(null);
          exitingOffsetRef.current = null;
          const visibleCount = stepIndexRef.current + 1;
          const slots = resolveAnimatedQueueSlots(completed, visibleCount);
          const nextJourney = [...journeySRef.current];
          for (const { index, slot } of slots) {
            if (slot.journeyS !== undefined) {
              nextJourney[index] = slot.journeyS;
            }
          }
          setLanternJourneyS(nextJourney);
          journeySRef.current = nextJourney;
          // #region agent log
          fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
            body: JSON.stringify({
              sessionId: "a4f3b7",
              runId: "order-fix",
              hypothesisId: "H3",
              location: "Lantern.stories.tsx:onPhaseIdle",
              message: "fadeToExit complete — synced follower journeys",
              data: {
                stepIndex: stepIndexRef.current,
                journeys: nextJourney.slice(0, visibleCount),
                newestPathS: slots.at(-1)?.slot.pathS,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          return completed;
        }

        if (completed.fadeProgress <= LANTERN_FLIGHT_PATH_REST_EPSILON) {
          setExitingOffset(null);
          exitingOffsetRef.current = null;
          const restored = buildCarouselLanternJourneyS(stepIndexRef.current, lanternCount);
          setLanternJourneyS(restored);
          journeySRef.current = restored;
          return completed;
        }

        return completed;
      }

      if (enteringOffsetRef.current !== null) {
        const visibleCount = queueVisibleCountRef.current;
        if (completed.fadeProgress >= 1 - 0.02) {
          return requestLanternQueueScrollStep(completed, -1, visibleCount, performance.now());
        }

        if (completed.fadeProgress <= 0.02) {
          const nextStep = Math.min(maxStepIndex, stepIndexRef.current + 1);
          const nextJourney = buildCarouselLanternJourneyS(nextStep, lanternCount);
          setStepIndex(nextStep);
          setLanternJourneyS(nextJourney);
          journeySRef.current = nextJourney;
          stepIndexRef.current = nextStep;
          setEnteringOffset(null);
          enteringOffsetRef.current = null;
          return createLanternQueueScrollState();
        }

        return completed;
      }

      return completed;
    },
  });

  const startQueueExit = (departingOffset: number, visibleCount: number) => {
    queueVisibleCountRef.current = visibleCount;
    setExitingOffset(departingOffset);
    exitingOffsetRef.current = departingOffset;
    const nextQueue = requestLanternQueueScrollStep(
      queueStateRef.current,
      1,
      visibleCount,
      performance.now(),
    );
    // #region agent log
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
      body: JSON.stringify({
        sessionId: "a4f3b7",
        runId: "two-phase-exit",
        hypothesisId: "H2",
        location: "Lantern.stories.tsx:startQueueExit",
        message: "queue exit requested",
        data: {
          phase: nextQueue.phase,
          priorFadeProgress: queueStateRef.current.fadeProgress,
          nextFadeProgress: nextQueue.fadeProgress,
          departingOffset,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    queueStateRef.current = nextQueue;
    setQueueState(nextQueue);
  };

  const startQueueRetreatFromExit = (departingOffset: number, visibleCount: number) => {
    queueVisibleCountRef.current = visibleCount;
    setExitingOffset(departingOffset);
    exitingOffsetRef.current = departingOffset;
    const nextQueue = requestLanternQueueScrollStep(
      queueStateRef.current,
      -1,
      visibleCount,
      performance.now(),
    );
    queueStateRef.current = nextQueue;
    setQueueState(nextQueue);
  };

  const startQueueEnter = (offset: number, visibleCount: number) => {
    queueVisibleCountRef.current = visibleCount;
    setEnteringOffset(offset);
    enteringOffsetRef.current = offset;
    const nextQueue = requestLanternQueueScrollStep(
      { ...createLanternQueueScrollState(), pushedOutCount: 1 },
      -1,
      visibleCount,
      performance.now(),
    );
    queueStateRef.current = nextQueue;
    setQueueState(nextQueue);
  };

  const stepBack = () => {
    if (queueStateRef.current.phase !== "idle") {
      return;
    }

    const currentStep = stepIndexRef.current;
    const state = queueStateRef.current;
    if (state.fadeProgress <= LANTERN_FLIGHT_PATH_REST_EPSILON && currentStep <= minStepIndex) {
      return;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    startQueueExit(currentStep, currentStep + 1);
  };

  const stepForward = () => {
    if (queueStateRef.current.phase !== "idle") {
      return;
    }

    const state = queueStateRef.current;
    if (state.fadeProgress >= 1 - LANTERN_FLIGHT_PATH_REST_EPSILON) {
      startQueueRetreatFromExit(stepIndexRef.current, stepIndexRef.current + 1);
      return;
    }

    if (stepIndexRef.current >= maxStepIndex) {
      return;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    startQueueEnter(stepIndexRef.current + 1, stepIndexRef.current + 2);
  };

  goToStepRef.current = (direction: number) => {
    if (direction < 0) {
      stepBack();
    } else if (direction > 0) {
      stepForward();
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToStepRef.current(-1);
      }
      if (event.key === "ArrowRight") {
        goToStepRef.current(1);
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
              const isExiting = exitingOffset === offset;
              const isEntering = enteringOffset === offset;
              const visibleAtStep = isCarouselLanternVisibleAtStep(stepIndex, offset);
              if (!visibleAtStep && !isExiting && !isEntering) return null;

              const haiku = WRITTEN_HAIKUS[offset % WRITTEN_HAIKUS.length];
              const haikuProps = {
                id: `flight-path-stop-lantern-${offset}`,
                title: haiku.title,
                body: haiku.body,
              };

              const useQueueSlot =
                isExiting ||
                isEntering ||
                (queueAnimating && visibleAtStep) ||
                (restingAtExit && visibleAtStep);

              if (useQueueSlot) {
                const animSlot = getCarouselQueueSlot(offset);
                if (!animSlot || !isLanternQueueSlotVisible(animSlot, queueState.phase)) {
                  return null;
                }

                return renderLanternExitSlot(
                  animSlot,
                  lanternClassName,
                  haikuProps,
                  `carousel-lantern-${offset}`,
                );
              }

              const slotJourneyS = lanternJourneyS[offset];
              if (slotJourneyS === undefined || !isLanternJourneyVisible(slotJourneyS)) return null;

              return (
                <Lantern
                  key={`carousel-lantern-${offset}`}
                  className={lanternClassName}
                  journeyS={slotJourneyS}
                  haiku={makeMockHaiku(haikuProps)}
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
          disabled={
            queueState.phase !== "idle" ||
            (activeStepIndex <= minStepIndex &&
              queueState.fadeProgress <= LANTERN_FLIGHT_PATH_REST_EPSILON)
          }
          onClick={stepBack}
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
          disabled={
            queueState.phase !== "idle" ||
            (activeStepIndex >= maxStepIndex &&
              queueState.fadeProgress < 1 - LANTERN_FLIGHT_PATH_REST_EPSILON)
          }
          onClick={stepForward}
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

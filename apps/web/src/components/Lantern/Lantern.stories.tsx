"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  AUTUMN_HAIKU_BODY,
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { Lantern } from "./Lantern";
import { LanternCard } from "./LanternCard";
import {
  equalArcLengthSamples,
  getLanternQueuePathProgress,
  LANTERN_FLIGHT_PATH_INITIAL,
  LANTERN_FLIGHT_QUEUE_SPACING,
  sampleLanternFlightPath,
} from "./lanternFlightPath";
import styles from "./Lantern.stories.module.css";

function FlightPathGuide() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- storybook path guide from public SVG
    <img className={styles.flightPathGuide} src="/fly_path.svg" alt="" aria-hidden />
  );
}

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

export const Generating: Story = {
  render: (args) => (
    <div className={styles.stage}>
      <Lantern {...args} />
    </div>
  ),
  args: {
    generatingDraft: {
      requestId: "lantern-req-1",
      subject: "Autumn wind",
      content: "Leaves fall —\n",
      createdAtLabel: "2:30 PM",
    },
  },
};

export const StaticSteps: Story = {
  parameters: { wideContent: true },
  render: () => {
    const haiku = makeMockHaiku({
      id: "lantern-steps",
      title: "Ascending",
      body: AUTUMN_HAIKU_BODY,
    });

    return (
      <div className={styles.flightPathStage}>
        <FlightPathGuide />
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <Lantern
            key={step}
            className={styles.flightPathLantern}
            haiku={haiku}
            step={step}
            maxSteps={5}
          />
        ))}
      </div>
    );
  },
};

const FLIGHT_PATH_LIST_COUNT = 7;
const FLIGHT_PATH_SAMPLES = equalArcLengthSamples(FLIGHT_PATH_LIST_COUNT);

export const FlightPathList: Story = {
  name: "Flight path / List",
  parameters: { wideContent: true },
  render: () => (
    <div className={styles.flightPathStage} aria-label="Lanterns along the flight path">
      <FlightPathGuide />
      {FLIGHT_PATH_SAMPLES.map((pathS, index) => {
        const haiku = WRITTEN_HAIKUS[index % WRITTEN_HAIKUS.length];
        const sample = sampleLanternFlightPath(pathS);
        return (
          <Fragment key={`${pathS}-${haiku.id}`}>
            <p
              className={styles.flightPathLabel}
              style={{ left: `${sample.x * 100}%`, top: `${sample.y * 100}%` }}
            >
              s={pathS.toFixed(2)}
            </p>
            <Lantern
              className={styles.flightPathLantern}
              progress={pathS}
              haiku={makeMockHaiku({
                id: `flight-path-${haiku.id}`,
                title: haiku.title,
                body: haiku.body,
              })}
            />
          </Fragment>
        );
      })}
    </div>
  ),
};

function FlightPathScrollDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight;
      setScrollProgress(max <= 0 ? 0 : Math.min(1, Math.max(0, root.scrollTop / max)));
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  const activeIndex = WRITTEN_HAIKUS.findIndex((_, index) => {
    const pathT = getLanternQueuePathProgress(
      scrollProgress,
      index,
      LANTERN_FLIGHT_QUEUE_SPACING,
    );
    return pathT >= LANTERN_FLIGHT_PATH_INITIAL - 0.02 && pathT <= LANTERN_FLIGHT_PATH_INITIAL + 0.06;
  });

  return (
    <div ref={rootRef} className={styles.flightPathScrollRoot}>
      <div className={styles.flightPathScrollTrack}>
        <div className={styles.flightPathScrollSticky}>
          <p className={styles.flightPathScrollHud}>
            scroll {(scrollProgress * 100).toFixed(0)}%
            {activeIndex >= 0 ? ` · active #${activeIndex + 1}` : ""}
          </p>
          <div className={styles.flightPathStage}>
            <FlightPathGuide />
            {WRITTEN_HAIKUS.map((item, index) => {
              const pathT = getLanternQueuePathProgress(
                scrollProgress,
                index,
                LANTERN_FLIGHT_QUEUE_SPACING,
              );
              const nextPathT =
                index < WRITTEN_HAIKUS.length - 1
                  ? getLanternQueuePathProgress(
                      scrollProgress,
                      index + 1,
                      LANTERN_FLIGHT_QUEUE_SPACING,
                    )
                  : undefined;

              return (
                <Lantern
                  key={item.id}
                  className={styles.flightPathLantern}
                  progress={pathT}
                  nextLanternPathProgress={nextPathT}
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
      </div>
    </div>
  );
}

export const FlightPathScroll: Story = {
  name: "Flight path / Scroll",
  parameters: { wideContent: true },
  render: () => <FlightPathScrollDemo />,
};

export const ScrollPath: Story = {
  parameters: { wideContent: true },
  render: () => <FlightPathScrollDemo />,
};

export const WrittenOnLanterns: Story = {
  name: "Written on lanterns",
  parameters: { wideContent: true },
  render: () => (
    <div className={styles.writtenList} role="list" aria-label="Haikus written on lanterns">
      {WRITTEN_HAIKUS.map((item) => (
        <div key={item.id} className={styles.writtenItem} role="listitem">
          <Lantern
            bodyOnly
            haiku={makeMockHaiku({
              id: item.id,
              title: item.title,
              body: item.body,
            })}
          />
        </div>
      ))}
    </div>
  ),
};

export const CardSaved: StoryObj<typeof LanternCard> = {
  name: "Card / Saved",
  render: (args) => (
    <div className={styles.stage}>
      <LanternCard {...args} />
    </div>
  ),
  args: {
    haiku: makeMockHaiku({
      id: "lantern-card-saved",
      title: "Night questions",
      body: EXAMPLE_HAIKU_BODY,
    }),
  },
};

export const CardGenerating: StoryObj<typeof LanternCard> = {
  name: "Card / Generating",
  render: (args) => (
    <div className={styles.stage}>
      <LanternCard {...args} />
    </div>
  ),
  args: {
    generatingDraft: {
      requestId: "lantern-card-req-1",
      subject: "Autumn wind",
      content: "Leaves fall —\n",
      createdAtLabel: "2:30 PM",
    },
  },
};

export const CardWithLabels: StoryObj<typeof LanternCard> = {
  name: "Card / With labels",
  render: (args) => (
    <div className={styles.stage}>
      <LanternCard {...args} />
    </div>
  ),
  args: {
    haiku: makeMockHaiku({
      id: "lantern-card-labels",
      title: "Evening breeze",
      body: AUTUMN_HAIKU_BODY,
      labels: [
        { id: "lbl-1", name: "nature", color: "green" },
        { id: "lbl-2", name: "autumn", color: "orange" },
      ],
    }),
  },
};

export const CardWrittenList: StoryObj<typeof LanternCard> = {
  name: "Card / Written list",
  parameters: { wideContent: true },
  render: () => (
    <div className={styles.writtenList} role="list" aria-label="Interactive lantern haikus">
      {WRITTEN_HAIKUS.map((item) => (
        <div key={item.id} className={styles.writtenItem} role="listitem">
          <LanternCard
            haiku={makeMockHaiku({
              id: item.id,
              title: item.title,
              body: item.body,
            })}
          />
        </div>
      ))}
    </div>
  ),
};

export const CelestialDeepNight: Story = {
  ...Default,
  parameters: {
    initialCelestialPreset: "deepNight" satisfies CelestialPresetName,
  },
};

export const CelestialSunset: Story = {
  ...Default,
  parameters: {
    initialCelestialPreset: "sunset" satisfies CelestialPresetName,
  },
};

export const CelestialDay: Story = {
  ...Default,
  parameters: {
    initialCelestialPreset: "day" satisfies CelestialPresetName,
  },
};

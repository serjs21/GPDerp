"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";
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
      <div className={styles.stepsGrid}>
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <div key={step} className={styles.stepCard}>
            <p className={styles.stepLabel}>{step === 0 ? "Ready" : `Step 0${step}`}</p>
            <Lantern haiku={haiku} step={step} />
          </div>
        ))}
      </div>
    );
  },
};

function ScrollPathDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max <= 0 ? 0 : Math.min(1, Math.max(0, root.scrollTop / max)));
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={rootRef} className={styles.scrollRoot}>
      <div className={styles.scrollTrack}>
        <div className={styles.scrollSticky}>
          <p className={styles.scrollHud}>progress {(progress * 100).toFixed(0)}%</p>
          <Lantern
            className={styles.scrollLantern}
            progress={progress}
            maxSteps={5}
            haiku={makeMockHaiku({
              id: "lantern-scroll",
              title: "Sky lantern",
              body: EXAMPLE_HAIKU_BODY,
            })}
          />
        </div>
      </div>
    </div>
  );
}

export const ScrollPath: Story = {
  parameters: { wideContent: true },
  render: () => <ScrollPathDemo />,
};

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

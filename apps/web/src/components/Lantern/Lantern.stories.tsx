"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { Lantern } from "./Lantern";
import { LanternFrame } from "./LanternFrame";
import { LanternPath } from "./LanternPath";
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

const fixtureHaikus = WRITTEN_HAIKUS.map((haiku) =>
  makeMockHaiku({
    id: haiku.id,
    title: haiku.title,
    body: haiku.body,
  }),
);

export const Default: Story = {
  render: (args) => (
    <div className={styles.stage}>
      <LanternFrame ariaLabel="Haiku lantern preview">
        <Lantern {...args} />
      </LanternFrame>
    </div>
  ),
  args: {
    haiku: makeMockHaiku({
      id: "lantern-default",
      title: "Night questions",
      titleSuffix: 0,
      body: EXAMPLE_HAIKU_BODY,
      createdAt: STORY_CREATED_AT,
      labels: [],
    }),
  },
};

type LanternPathStoryArgs = {
  haikuCount: number;
};

export const FlightPath: StoryObj<LanternPathStoryArgs> = {
  name: "Flight path",
  parameters: { wideContent: true },
  argTypes: {
    haikuCount: { control: { type: "range", min: 1, max: 20, step: 1 } },
  },
  args: { haikuCount: 5 },
  render: ({ haikuCount }) => (
    <LanternPath haikus={fixtureHaikus.slice(0, haikuCount)} showGuides />
  ),
};

export const FlightPathStops: StoryObj<LanternPathStoryArgs> = {
  name: "Flight path stops",
  parameters: { wideContent: true },
  argTypes: {
    haikuCount: { control: { type: "range", min: 1, max: 20, step: 1 } },
  },
  args: { haikuCount: 8 },
  render: ({ haikuCount }) => (
    <LanternPath
      key={haikuCount}
      haikus={fixtureHaikus.concat(fixtureHaikus).slice(0, haikuCount)}
      showGuides
    />
  ),
};

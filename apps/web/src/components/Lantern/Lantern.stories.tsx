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
import { type LabelBeltItem } from "./LabelBelt";
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

const LANTERN_LABEL_FIXTURES = [
  { id: "l-short", name: "Zen", color: "green" },
  { id: "l-medium", name: "Morning mist", color: "blue" },
  { id: "l-long", name: "Late autumn philosophy", color: "purple" },
] as const;

const LANTERN_LABEL_SIZES = [
  { widthRem: 6, caption: "6rem · path mini" },
  { widthRem: 9, caption: "9rem · path focused" },
  { widthRem: 12, caption: "12rem · medium" },
  { widthRem: 17.5, caption: "17.5rem · default" },
] as const;

export const LanternsLabels: Story = {
  name: "Labels",
  render: () => (
    <div className={styles.labelsStage}>
      {LANTERN_LABEL_SIZES.map(({ widthRem, caption }) => (
        <div key={widthRem} className={styles.labelsSample}>
          <LanternFrame
            widthRem={widthRem}
            ariaLabel={`Haiku lantern with labels at ${widthRem}rem`}
          >
            <Lantern
              showActions={false}
              haiku={makeMockHaiku({
                id: `lantern-labels-${widthRem}`,
                title: "Night questions",
                titleSuffix: 0,
                body: EXAMPLE_HAIKU_BODY,
                createdAt: STORY_CREATED_AT,
                labels: [...LANTERN_LABEL_FIXTURES],
              })}
            />
          </LanternFrame>
          <p className={styles.labelsCaption}>{caption}</p>
        </div>
      ))}
    </div>
  ),
};

const BELT_LABELS_FIVE: LabelBeltItem[] = [
  { id: "b1", name: "Zen", color: "#52c41a" },
  { id: "b2", name: "Mist", color: "#1677ff" },
  { id: "b3", name: "Autumn", color: "#faad14" },
  { id: "b4", name: "Moon", color: "#eb2f96" },
  { id: "b5", name: "Night", color: "#722ed1" },
];

const BELT_LABELS_TWELVE: LabelBeltItem[] = [
  ...BELT_LABELS_FIVE,
  { id: "b6", name: "Pond", color: "#13c2c2" },
  { id: "b7", name: "Crow", color: "#fa541c" },
  { id: "b8", name: "Snow", color: "#ffffff" },
  { id: "b9", name: "Bell", color: "#2f54eb" },
  { id: "b10", name: "Grass", color: "#a0d911" },
  { id: "b11", name: "Wind", color: "#eb2f96" },
  { id: "b12", name: "Ink", color: "#17131A" },
];

function LabelBeltLanternHost({ labels }: { labels: LabelBeltItem[] }) {
  return (
    <div className={styles.beltStage}>
      <LanternFrame ariaLabel="Haiku lantern with label belt" labels={labels}>
        <Lantern
          haiku={makeMockHaiku({
            id: "lantern-label-belt",
            title: "Night questions",
            titleSuffix: 0,
            body: EXAMPLE_HAIKU_BODY,
            createdAt: STORY_CREATED_AT,
            labels: [],
          })}
        />
      </LanternFrame>
    </div>
  );
}

export const LabelBeltStory: Story = {
  name: "Label belt",
  render: () => <LabelBeltLanternHost labels={BELT_LABELS_FIVE} />,
};

export const LabelBeltOverflow: Story = {
  name: "Label belt overflow",
  render: () => <LabelBeltLanternHost labels={BELT_LABELS_TWELVE} />,
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

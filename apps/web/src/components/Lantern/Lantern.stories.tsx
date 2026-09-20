"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  withMockAuthentication,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import {
  COMIC_LABEL_NAME_MAX,
  COMIC_LABEL_NAME_MIN,
} from "@/components/ComicLabelCreationModal";
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
  decorators: [
    composeDecorators(withQueryClient, withMockAuthentication, withThemedStoryStage),
  ],
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
  { id: "l-short", name: "Zen", color: "green", shape: "classic" },
  { id: "l-medium", name: "Morning mist", color: "blue", shape: "classic" },
  { id: "l-long", name: "Late autumn philosophy", color: "purple", shape: "classic" },
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

const BELT_COLORS = [
  "#52c41a",
  "#1677ff",
  "#faad14",
  "#eb2f96",
  "#722ed1",
  "#13c2c2",
] as const;

/** Six 3-char labels — one per belt stop (fill order clockwise from bl). */
const BELT_LABELS_MIN: LabelBeltItem[] = [
  { id: "min-bl", name: "Zen", color: BELT_COLORS[0] },
  { id: "min-br", name: "Fog", color: BELT_COLORS[1] },
  { id: "min-mr", name: "Oak", color: BELT_COLORS[2] },
  { id: "min-tr", name: "Ash", color: BELT_COLORS[3] },
  { id: "min-tl", name: "Sky", color: BELT_COLORS[4] },
  { id: "min-ml", name: "Ink", color: BELT_COLORS[5] },
];

/** Six max-length (15-char) labels — same stop mapping / colors as min. */
const BELT_LABELS_MAX: LabelBeltItem[] = [
  { id: "max-bl", name: "AutumnPhilosphy", color: BELT_COLORS[0] },
  { id: "max-br", name: "MorningMistPond", color: BELT_COLORS[1] },
  { id: "max-mr", name: "LanternMoonRoad", color: BELT_COLORS[2] },
  { id: "max-tr", name: "WitheredBranchX", color: BELT_COLORS[3] },
  { id: "max-tl", name: "VillageTempleBe", color: BELT_COLORS[4] },
  { id: "max-ml", name: "SummerGrassWind", color: BELT_COLORS[5] },
];

const BELT_LABELS_FIVE: LabelBeltItem[] = BELT_LABELS_MIN.slice(0, 5);

const BELT_LABELS_TWELVE: LabelBeltItem[] = [
  ...BELT_LABELS_FIVE,
  { id: "b6", name: "Pond", color: "#13c2c2", shape: "classic" },
  { id: "b7", name: "Crow", color: "#fa541c", shape: "classic" },
  { id: "b8", name: "Snow", color: "#ffffff", shape: "classic" },
  { id: "b9", name: "Bell", color: "#2f54eb", shape: "classic" },
  { id: "b10", name: "Grass", color: "#a0d911", shape: "classic" },
  { id: "b11", name: "Wind", color: "#eb2f96", shape: "classic" },
  { id: "b12", name: "Ink", color: "#17131A", shape: "classic" },
];

function LabelBeltLanternHost({
  labels,
  ariaLabel = "Haiku lantern with label belt",
  compact,
}: {
  labels: LabelBeltItem[];
  ariaLabel?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? styles.beltCompareHost : styles.beltStage}>
      <LanternFrame ariaLabel={ariaLabel} labels={labels}>
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

function LabelBeltLengthCompareHost() {
  return (
    <div className={styles.beltCompareStage}>
      <div className={styles.beltCompareSample}>
        <LabelBeltLanternHost
          labels={BELT_LABELS_MIN}
          ariaLabel="Label belt min length (3 chars)"
          compact
        />
        <p className={styles.beltCompareCaption}>
          {COMIC_LABEL_NAME_MIN}-char names · same stops
        </p>
      </div>
      <div className={styles.beltCompareSample}>
        <LabelBeltLanternHost
          labels={BELT_LABELS_MAX}
          ariaLabel="Label belt max length (15 chars)"
          compact
        />
        <p className={styles.beltCompareCaption}>
          {COMIC_LABEL_NAME_MAX}-char names · same stops
        </p>
      </div>
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

export const LabelBeltLengthCompare: Story = {
  name: "Label belt length compare",
  render: () => <LabelBeltLengthCompareHost />,
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

const ROTATED_DEMO_HAIKU = makeMockHaiku({
  id: "lantern-rotated-demo",
  title: "Night questions",
  body: EXAMPLE_HAIKU_BODY,
  createdAt: STORY_CREATED_AT,
});

export const RotatedBase: Story = {
  name: "Rotated base (lantern_base_rotated)",
  render: () => (
    <div className={styles.stage}>
      <Lantern
        rotationBase="rotated"
        haiku={ROTATED_DEMO_HAIKU}
        showActions
      />
    </div>
  ),
};

export const RotatedBase2: Story = {
  name: "Rotated base 2 (lanter-base-rotated-2)",
  render: () => (
    <div className={styles.stage}>
      <Lantern
        rotationBase="rotated2"
        haiku={ROTATED_DEMO_HAIKU}
        showActions
      />
    </div>
  ),
};

export const RotatedBoth: Story = {
  name: "Rotated bases side by side",
  render: () => (
    <div className={styles.labelsStage}>
      <div className={styles.labelsSample}>
        <Lantern
          rotationBase="rotated"
          haiku={ROTATED_DEMO_HAIKU}
          showActions
          widthRem={14}
        />
        <p className={styles.labelsCaption}>lantern_base_rotated</p>
      </div>
      <div className={styles.labelsSample}>
        <Lantern
          rotationBase="rotated2"
          haiku={ROTATED_DEMO_HAIKU}
          showActions
          widthRem={14}
        />
        <p className={styles.labelsCaption}>lanter-base-rotated-2</p>
      </div>
    </div>
  ),
};

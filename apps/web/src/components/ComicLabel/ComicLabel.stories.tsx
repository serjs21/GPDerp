import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { COMIC_SOURCE_DIRECTIONS } from "@/components/ComicConfirmModal";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { ComicLabel } from "./ComicLabel";
import { ComicLabelCircleRing } from "./ComicLabelCircleRing";
import { COMIC_LABEL_DEFAULT_BUBBLE_STYLE } from "./comicLabelBubblePresets";
import type { ComicLabelCircleItem } from "./comicLabelCircleLayout";
import styles from "./ComicLabel.stories.module.css";

const meta = {
  title: "Haiku/ComicLabel",
  component: ComicLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story, { parameters }) =>
      parameters.skipComicLabelCanvas ? (
        <Story />
      ) : (
        <div className={styles.canvas}>
          <Story />
        </div>
      ),
  ],
  args: {
    name: "POW!",
    color: "#13c2c2",
    bubbleStyle: COMIC_LABEL_DEFAULT_BUBBLE_STYLE,
    sourceDirection: "none",
  },
} satisfies Meta<typeof ComicLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LeftTail: Story = {
  args: {
    name: "Zen",
    color: "#ffffff",
    bubbleStyle: "speech",
    sourceDirection: "left",
  },
  decorators: [
    (Story) => (
      <div className={styles.canvasPink}>
        <Story />
      </div>
    ),
  ],
};

const BURST_SAMPLES = [
  { name: "POW!", color: "#faad14" },
  { name: "WOW!", color: "#13c2c2" },
  { name: "OMG!", color: "#ffffff" },
  { name: "BANG!", color: "#52c41a" },
  { name: "ZAP!", color: "#1677ff" },
  { name: "WHAM!", color: "#eb2f96" },
] as const;

export const BurstGallery: Story = {
  name: "Burst gallery",
  render: () => (
    <div className={styles.gallery}>
      {BURST_SAMPLES.map((sample) => (
        <ComicLabel key={sample.name} name={sample.name} color={sample.color} />
      ))}
    </div>
  ),
};

export const SpeechVariant: Story = {
  name: "Speech variant",
  render: () => (
    <div className={styles.gallery}>
      {BURST_SAMPLES.slice(0, 4).map((sample) => (
        <ComicLabel
          key={sample.name}
          name={sample.name}
          color={sample.color}
          bubbleStyle="speech"
          sourceDirection="bottom"
        />
      ))}
    </div>
  ),
};

const CONTRAST_SAMPLES = [
  { name: "White", color: "#ffffff" },
  { name: "Near black", color: "#17131A" },
  { name: "Blue", color: "#1677ff" },
  { name: "Green", color: "green" },
  { name: "Gold", color: "#faad14" },
  { name: "Purple", color: "purple" },
  { name: "Cyan", color: "#13c2c2" },
  { name: "Default", color: "default" },
] as const;

export const ContrastGallery: Story = {
  name: "Contrast gallery",
  render: () => (
    <div className={styles.galleryWide}>
      {CONTRAST_SAMPLES.map((sample) => (
        <ComicLabel key={sample.color} name={sample.name} color={sample.color} />
      ))}
    </div>
  ),
};

export const AllDirections: Story = {
  name: "All directions (speech)",
  render: () => (
    <div className={styles.directionGrid}>
      {COMIC_SOURCE_DIRECTIONS.map((direction) => (
        <ComicLabel
          key={direction}
          name={direction}
          color="#fff9c4"
          bubbleStyle="speech"
          sourceDirection={direction}
        />
      ))}
    </div>
  ),
};

const TEXT_LENGTH_SAMPLES = [
  { name: "A", color: "#1677ff" },
  { name: "Hi", color: "#52c41a" },
  { name: "Morning", color: "#faad14" },
  { name: "Morning mist", color: "#eb2f96" },
  { name: "Late autumn morning", color: "#722ed1" },
  { name: "Soft golden hour light", color: "#fa541c" },
] as const;

export const TextLengths: Story = {
  name: "Text lengths",
  render: () => (
    <div className={styles.lengthColumn}>
      {TEXT_LENGTH_SAMPLES.map((sample) => (
        <ComicLabel key={sample.name} name={sample.name} color={sample.color} />
      ))}
    </div>
  ),
};

const CIRCLE_LABELS: ComicLabelCircleItem[] = [
  { id: "top-left", name: "POW!", color: "#1677ff" },
  { id: "top", name: "WOW!", color: "#52c41a" },
  { id: "top-right", name: "ZAP!", color: "#faad14" },
  { id: "bottom-right", name: "BANG!", color: "#eb2f96" },
  { id: "bottom-left", name: "OMG!", color: "#722ed1" },
];

export const CircleAroundDotAnchor: Story = {
  name: "Circle around dot anchor",
  render: () => (
    <ComicLabelCircleRing
      labels={CIRCLE_LABELS}
      className={styles.circleStage}
      stageClassName={styles.circleBubbleStage}
    >
      <div className={styles.circleAnchor} aria-label="Circle anchor" />
    </ComicLabelCircleRing>
  ),
};

const LANTERN_CIRCLE_LABELS: ComicLabelCircleItem[] = [
  { id: "top-left", name: "Zen", color: "#52c41a" },
  { id: "top", name: "Mist", color: "#1677ff" },
  { id: "top-right", name: "Autumn", color: "#faad14" },
  { id: "bottom-right", name: "Moon", color: "#eb2f96" },
  { id: "bottom-left", name: "Night", color: "#722ed1" },
];

export const CircleAroundLantern: Story = {
  name: "Circle around lantern",
  parameters: {
    layout: "fullscreen",
    skipComicLabelCanvas: true,
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
  render: () => (
    <div className={styles.lanternCircleHost}>
      <ComicLabelCircleRing
        labels={LANTERN_CIRCLE_LABELS}
        radius={0.4}
        className={styles.lanternCircleStage}
        stageClassName={styles.lanternCircleBubbleStage}
      >
        <div className={styles.lanternCircleAnchor}>
          <LanternFrame ariaLabel="Haiku lantern with comic labels">
            <Lantern
              haiku={makeMockHaiku({
                id: "comic-label-lantern-circle",
                title: "Night questions",
                titleSuffix: 0,
                body: EXAMPLE_HAIKU_BODY,
                createdAt: STORY_CREATED_AT,
                labels: [],
              })}
            />
          </LanternFrame>
        </div>
      </ComicLabelCircleRing>
    </div>
  ),
};

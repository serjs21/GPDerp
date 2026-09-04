import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComicLabel, type ComicLabelShape } from "./ComicLabel";
import styles from "./ComicLabel.stories.module.css";

const meta = {
  title: "Haiku/ComicLabel",
  component: ComicLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className={styles.canvas}>
        <Story />
      </div>
    ),
  ],
  args: {
    text: "POW",
    shape: "burst",
    color: "#ff6b35",
  },
} satisfies Meta<typeof ComicLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default burst-shaped label
 */
export const Default: Story = {
  args: {
    text: "Moon",
    shape: "burst",
    color: "#ff6b35",
  },
};

/**
 * Gallery of burst-shaped labels with different colors
 */
const BURST_SAMPLES = [
  { text: "Moon", color: "#faad14" },
  { text: "Night", color: "#13c2c2" },
  { text: "Pond", color: "#ffffff" },
  { text: "Zen", color: "#52c41a" },
  { text: "Mist", color: "#1677ff" },
  { text: "Crow", color: "#eb2f96" },
] as const;

export const BurstGallery: Story = {
  name: "Burst gallery",
  render: () => (
    <div className={styles.gallery}>
      {BURST_SAMPLES.map((sample) => (
        <ComicLabel key={sample.text} text={sample.text} shape="burst" color={sample.color} />
      ))}
    </div>
  ),
};

/**
 * Showcase all shape variants with the same text and color
 */
const SHAPES: ComicLabelShape[] = ["burst", "rounded", "square", "thought", "ellipse", "diamond"];

export const AllShapes: Story = {
  name: "All shapes",
  render: () => (
    <div className={styles.gallery}>
      {SHAPES.map((shape) => (
        <ComicLabel key={shape} text={shape} shape={shape} color="#ff6b35" />
      ))}
    </div>
  ),
};

/**
 * Contrast test with various colors
 */
const CONTRAST_SAMPLES = [
  { text: "White", color: "#ffffff" },
  { text: "Black", color: "#17131A" },
  { text: "Blue", color: "#1677ff" },
  { text: "Green", color: "#52c41a" },
  { text: "Gold", color: "#faad14" },
  { text: "Purple", color: "#722ed1" },
  { text: "Cyan", color: "#13c2c2" },
  { text: "Orange", color: "#fa541c" },
] as const;

export const ContrastGallery: Story = {
  name: "Contrast gallery",
  render: () => (
    <div className={styles.galleryWide}>
      {CONTRAST_SAMPLES.map((sample) => (
        <ComicLabel
          key={sample.color}
          text={sample.text}
          shape="burst"
          color={sample.color}
        />
      ))}
    </div>
  ),
};

/**
 * Text length variations with word wrapping
 */
const TEXT_LENGTH_SAMPLES = [
  { text: "A", color: "#1677ff" },
  { text: "Hi", color: "#52c41a" },
  { text: "Moon", color: "#faad14" },
  { text: "Moon Night", color: "#eb2f96" },
  { text: "Late autumn night", color: "#722ed1" },
  { text: "Soft golden autumn light", color: "#fa541c" },
] as const;

export const TextLengths: Story = {
  name: "Text lengths",
  render: () => (
    <div className={styles.lengthColumn}>
      {TEXT_LENGTH_SAMPLES.map((sample) => (
        <ComicLabel
          key={sample.text}
          text={sample.text}
          shape="burst"
          color={sample.color}
        />
      ))}
    </div>
  ),
};

/**
 * Each shape with a long text to show wrapping behavior
 */
export const ShapesWithLongText: Story = {
  name: "Shapes with long text",
  render: () => (
    <div className={styles.gallery}>
      {SHAPES.map((shape) => (
        <ComicLabel
          key={shape}
          text="Echo speaks"
          shape={shape}
          color="#ff6b35"
        />
      ))}
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComicBurstLabel } from "./ComicBurstLabel";

const meta = {
  title: "Haiku/ComicBurstLabel",
  component: ComicBurstLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    text: "MOONLIGHT!",
    fill: "#f4511e",
    stroke: "#000000",
    spikeCount: 12,
    randomness: 0.18,
  },
} satisfies Meta<typeof ComicBurstLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const PREVIEW_LABELS = [
  { text: "Crow", fill: "#fa541c" },
  { text: "AUTUMN!", fill: "#faad14" },
  { text: "MOONLIGHT!", fill: "#f4511e" },
  { text: "POND!", fill: "#13c2c2" },
] as const;

/**
 * Short vs long strings — same component, different silhouettes via text seed.
 */
export const Preview: Story = {
  name: "Preview (Crow / AUTUMN / MOONLIGHT / POND)",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.75rem",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        maxWidth: "40rem",
        background: "#1a2744",
        borderRadius: "0.5rem",
      }}
    >
      {PREVIEW_LABELS.map((sample) => (
        <ComicBurstLabel
          key={sample.text}
          text={sample.text}
          fill={sample.fill}
          spikeCount={12}
          randomness={0.18}
        />
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  name: "Shape kinds",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.25rem",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#1a2744",
        borderRadius: "0.5rem",
      }}
    >
      {(
        [
          { text: "BURST!", kind: "burst" as const },
          { text: "RECT!", kind: "rect" as const },
          { text: "CIRCLE!", kind: "circle" as const },
          { text: "SQUARE!", kind: "square" as const },
          { text: "THOUGHT!", kind: "thought" as const },
        ] as const
      ).map((sample) => (
        <ComicBurstLabel
          key={sample.kind}
          text={sample.text}
          fill="#f4511e"
          shapeKind={sample.kind}
          spikeCount={12}
          randomness={0.18}
        />
      ))}
    </div>
  ),
};

export const Controls: Story = {
  args: {
    text: "BANG!",
    fill: "#eb2f96",
    spikeCount: 14,
    randomness: 0.22,
  },
};


import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OrigamiNote } from "./OrigamiNote";

const meta = {
  title: "Animations/OrigamiNote",
  component: OrigamiNote,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Bird-base crease pattern triangulated into CSS-clipped panels. Folds use a vertex-based 3D hinge solver — shared edges stay connected at every rotation point.",
      },
    },
  },
  args: {
    size: 280,
    lineColor: "#000000",
    showCreaseGuides: true,
    state: "flat",
    progress: 1,
  },
  argTypes: {
    size: { control: { type: "range", min: 120, max: 480, step: 4 } },
    lineColor: { control: "color" },
    colorSeed: { control: { type: "number" } },
    showCreaseGuides: { control: "boolean" },
    state: { control: "radio", options: ["flat", "collapsed", "birdPartial"] },
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    foldProgress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
} satisfies Meta<typeof OrigamiNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Flat: Story = {
  args: {
    state: "flat",
    progress: 1,
  },
};

export const StablePalette: Story = {
  args: {
    colorSeed: 42,
    state: "flat",
  },
};

export const WithContent: Story = {
  args: {
    colorSeed: 42,
    state: "flat",
  },
  render: (args) => (
    <OrigamiNote {...args}>
      <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Note</span>
    </OrigamiNote>
  ),
};

export const Collapsed: Story = {
  args: {
    state: "collapsed",
    progress: 1,
    colorSeed: 42,
    showCreaseGuides: false,
  },
};

export const BirdPartial: Story = {
  args: {
    state: "birdPartial",
    progress: 1,
    colorSeed: 42,
    showCreaseGuides: false,
  },
};

export const FoldScrubber: Story = {
  args: {
    colorSeed: 42,
    showCreaseGuides: false,
    foldProgress: 0.5,
  },
};

/** @deprecated Use Flat */
export const Default: Story = Flat;

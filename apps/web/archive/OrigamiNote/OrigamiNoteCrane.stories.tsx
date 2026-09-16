import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OrigamiNoteCrane } from "./OrigamiNoteCrane";

const meta = {
  title: "Animations/OrigamiNoteCrane",
  component: OrigamiNoteCrane,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Crane pose folded from the flat bird-base crease pattern. Uses the connected 3D hinge solver with neck, tail, belly, and head tuck transforms on shared crease edges.",
      },
    },
  },
  args: {
    size: 320,
    lineColor: "#000000",
    colorSeed: 42,
    progress: 1,
  },
  argTypes: {
    size: { control: { type: "range", min: 160, max: 520, step: 4 } },
    lineColor: { control: "color" },
    colorSeed: { control: { type: "number" } },
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
} satisfies Meta<typeof OrigamiNoteCrane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Crane: Story = {
  args: {
    progress: 1,
  },
};

export const CraneFoldFromFlat: Story = {
  args: {
    progress: 0.72,
  },
  parameters: {
    docs: {
      description: {
        story: "Mid-animation from flat square toward the crane pose.",
      },
    },
  },
};

export const CraneScrubber: Story = {
  args: {
    progress: 0.5,
  },
};

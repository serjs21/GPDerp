import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LANTERN_LOADER_DEFAULTS } from "./consts/lanternLoaderConsts";
import { LanternLoader } from "./LanternLoader";

const meta = {
  title: "Loaders/LanternLoader",
  component: LanternLoader,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ padding: "3rem", background: "#f7f4ef" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    widthRem: LANTERN_LOADER_DEFAULTS.widthRem,
    steps: LANTERN_LOADER_DEFAULTS.steps.map((step) => ({ ...step })),
    stepTransitionMs: LANTERN_LOADER_DEFAULTS.stepTransitionMs,
  },
  argTypes: {
    widthRem: { control: { type: "range", min: 2, max: 24, step: 0.5 } },
    steps: {
      control: "object",
      description: "Poses in order: rotationDeg, xPercent / yPercent (of the lantern's size), scale, opacity.",
    },
    stepTransitionMs: { control: { type: "range", min: 20, max: 3000, step: 10 } },
    className: { control: false },
  },
} satisfies Meta<typeof LanternLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 1.2s per transition: easier to read each pose while tuning. */
export const SlowMotion: Story = {
  args: { stepTransitionMs: 1200 },
};

/** Bob up and down while fading, no rotation. */
export const Float: Story = {
  args: {
    steps: [
      { rotationDeg: 0, xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },
      { rotationDeg: 0, xPercent: 0, yPercent: -8, scale: 1.05, opacity: 0.6 },
    ],
    stepTransitionMs: 700,
  },
};

/** Drift left to right in three hops. */
export const Drift: Story = {
  args: {
    steps: [
      { rotationDeg: -4, xPercent: -20, yPercent: 0, scale: 0.95, opacity: 0.7 },
      { rotationDeg: 0, xPercent: 0, yPercent: -5, scale: 1, opacity: 1 },
      { rotationDeg: 4, xPercent: 20, yPercent: 0, scale: 0.95, opacity: 0.7 },
    ],
  },
};

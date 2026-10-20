import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WAG_TAIL_LOADER_DEFAULTS } from "./consts/wagTailLoaderConsts";
import { WagTailLoader } from "./WagTailLoader";

const range = (min: number, max: number, step = 1) => ({ control: { type: "range" as const, min, max, step } });

const meta = {
  title: "Loaders/WagTailLoader",
  component: WagTailLoader,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ padding: "3rem", background: "#f7f4ef" }}>
        <Story />
      </div>
    ),
  ],
  args: { ...WAG_TAIL_LOADER_DEFAULTS, opacities: [...WAG_TAIL_LOADER_DEFAULTS.opacities] },
  argTypes: {
    widthRem: range(4, 24, 0.5),
    attachXPercent: range(0, 120, 0.5),
    attachYPercent: range(0, 120, 0.5),
    tailWidthPercent: range(5, 60, 0.5),
    baseRotationDeg: range(-180, 180),
    stepDeg: range(0, 60),
    baseJitterDeg: range(0, 15, 0.5),
    stepJitterDeg: range(0, 15, 0.5),
    stepMs: range(50, 1000, 10),
    opacityJumpSteps: range(1, 3),
    linesOffsetXPercent: range(-60, 60, 0.5),
    linesOffsetYPercent: range(-60, 60, 0.5),
    linesWidthPercent: range(5, 80, 0.5),
    linesBaseRotationDeg: range(-180, 180),
    linesShiftPx: range(0, 10, 0.5),
    linesRotateDeg: range(0, 20, 0.5),
    className: { control: false },
  },
} satisfies Meta<typeof WagTailLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Red dot = attach point (tail copies pivot on their bottom-left corner here). Drag the controls to place it. */
export const AttachPointTuning: Story = {
  args: { showAttachPoint: true, widthRem: 20 },
};

/** 400ms per step: watch the 60 → 100 → 80 → 50 opacity pattern move one copy per tick. */
export const SlowMotion: Story = {
  args: { stepMs: 400, showAttachPoint: true },
};

/**
 * With "prefers-reduced-motion: reduce" (OS setting, or DevTools > Rendering > Emulate CSS media feature)
 * only one tail copy shows, fully opaque, and nothing moves.
 */
export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story: "Enable reduced motion in the OS or DevTools to see the static fallback.",
      },
    },
  },
};

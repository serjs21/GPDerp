import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DEFAULT_ROTATION_X,
  DEFAULT_ROTATION_Y,
  DEFAULT_SIZE,
  Lantern3D,
  WALL_ASSET_ASPECT,
} from "./Lantern3D";

const BASE_SRC = "/experiment/lantern_base_only.png";
const WALL_SRC = "/experiment/lantern-wall.png";

const meta = {
  title: "Experiments/Lantern3D",
  component: Lantern3D,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    baseSrc: BASE_SRC,
    wallSrc: WALL_SRC,
    size: DEFAULT_SIZE,
    height: Math.round(DEFAULT_SIZE * WALL_ASSET_ASPECT),
    rotationX: DEFAULT_ROTATION_X,
    rotationY: DEFAULT_ROTATION_Y,
  },
  argTypes: {
    size: { control: { type: "range", min: 160, max: 480, step: 8 } },
    height: { control: { type: "range", min: 120, max: 480, step: 8 } },
    rotationX: { control: { type: "range", min: -60, max: 40, step: 1 } },
    rotationY: { control: { type: "range", min: -180, max: 180, step: 1 } },
  },
} satisfies Meta<typeof Lantern3D>;

export default meta;
type Story = StoryObj<typeof meta>;

const stageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #1a1c28 0%, #2c3140 55%, #3d4658 100%)",
} as const;

const labelStyle = {
  margin: 0,
  padding: "0.4rem 0.65rem",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "0.85rem",
  letterSpacing: "0.04em",
  color: "#f4e8c8",
  background: "rgba(20, 16, 10, 0.45)",
  borderRadius: "2px",
} as const;

/**
 * Demo usage:
 *
 * ```tsx
 * import { Lantern3D } from "@/components/Lantern3D";
 *
 * <Lantern3D
 *   baseSrc="/experiment/lantern_base_only.png"
 *   wallSrc="/experiment/lantern-wall.png"
 * >
 *   <p>Inside</p>
 * </Lantern3D>
 * ```
 */
export const Default: Story = {
  render: (args) => (
    <div style={stageStyle}>
      <Lantern3D {...args}>
        <p style={labelStyle}>Inside</p>
      </Lantern3D>
    </div>
  ),
};

export const Empty: Story = {
  name: "No children",
  render: (args) => (
    <div style={stageStyle}>
      <Lantern3D {...args} />
    </div>
  ),
};

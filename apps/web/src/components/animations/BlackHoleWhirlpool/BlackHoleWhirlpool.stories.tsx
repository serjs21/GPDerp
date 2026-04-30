import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BlackHoleWhirlpool } from "./BlackHoleWhirlpool";

type BlackHoleStoryArgs = {
  duration: number;
  rotationSpeed: number;
  insideEaseInPower: number;
  containerWidth: number;
  containerHeight: number;
  displayText: string;
};

const meta = {
  title: "Animations/BlackHoleWhirlpool",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Black hole text collapse animation primitive.",
      },
    },
  },
} satisfies Meta<BlackHoleStoryArgs>;

export default meta;
type Story = StoryObj<BlackHoleStoryArgs>;

export const Default: Story = {
  args: {
    duration: 1900,
    rotationSpeed: 1,
    insideEaseInPower: 2,
    containerWidth: 520,
    containerHeight: 120,
    displayText: "Login Register - pulled into black hole",
  },
  argTypes: {
    duration: {
      control: { type: "range", min: 500, max: 6000, step: 100 },
    },
    rotationSpeed: {
      control: { type: "range", min: 0.2, max: 4, step: 0.05 },
    },
    insideEaseInPower: {
      control: { type: "range", min: 1, max: 5, step: 0.1 },
    },
    containerWidth: {
      control: { type: "range", min: 180, max: 800, step: 10 },
    },
    containerHeight: {
      control: { type: "range", min: 44, max: 260, step: 2 },
    },
    displayText: {
      control: { type: "text" },
    },
  },
  render: ({ duration, rotationSpeed, insideEaseInPower, displayText, containerWidth, containerHeight }) => {
    const animationKey = `${displayText}-${duration}-${rotationSpeed}-${insideEaseInPower}-${containerWidth}-${containerHeight}`;
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: containerWidth,
            height: containerHeight,
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap" }}>
            <BlackHoleWhirlpool
              key={animationKey}
              duration={duration}
              rotationSpeed={rotationSpeed}
              insideTransformEaseInPower={insideEaseInPower}
            >
              {displayText}
            </BlackHoleWhirlpool>
          </div>
        </div>
      </div>
    );
  },
};

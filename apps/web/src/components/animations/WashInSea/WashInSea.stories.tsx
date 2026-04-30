import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WashInSea, type WashDirection } from "./WashInSea";

type WashInSeaStoryArgs = {
  direction: WashDirection;
  duration: number;
};

const meta = {
  title: "Animations/WashInSea",
  component: WashInSea,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof WashInSea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    direction: "right",
    duration: 1900,
    children: "Login Register - carried by sea",
  } as WashInSeaStoryArgs & { children: string },
  argTypes: {
    direction: {
      control: { type: "select" },
      options: ["left", "right", "up", "down"],
    },
    duration: {
      control: { type: "range", min: 500, max: 6000, step: 100 },
    },
    children: {
      control: { type: "text" },
    },
  },
};

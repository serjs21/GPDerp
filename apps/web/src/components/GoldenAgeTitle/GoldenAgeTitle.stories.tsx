import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GoldenAgeTitle } from "./GoldenAgeTitle";

const meta = {
  title: "Landing/GoldenAgeTitle",
  component: GoldenAgeTitle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof GoldenAgeTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

const nightSky = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  width: "min(48vw, 42rem)",
  minHeight: "22rem",
  padding: "2.5rem 2rem 3rem",
  background: "linear-gradient(180deg, #171a33 0%, #312b4a 54%, #665064 100%)",
} as const;

export const Default: Story = {
  render: (args) => (
    <div style={nightSky}>
      <GoldenAgeTitle {...args} />
    </div>
  ),
};

export const Narrow: Story = {
  name: "Narrow slot",
  render: (args) => (
    <div style={{ ...nightSky, width: "16rem" }}>
      <GoldenAgeTitle {...args} />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BackgroundSceneStoryStage } from "./BackgroundSceneStoryStage";

const meta: Meta<typeof BackgroundSceneStoryStage> = {
  title: "Layout/BackgroundScene",
  component: BackgroundSceneStoryStage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof BackgroundSceneStoryStage>;

export const Interactive: Story = {
  render: () => <BackgroundSceneStoryStage initialSlot={16} />,
};

export const Sunset: Story = {
  render: () => <BackgroundSceneStoryStage initialCelestialPreset="sunset" />,
};

export const DeepNight: Story = {
  render: () => <BackgroundSceneStoryStage initialCelestialPreset="deepNight" />,
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HaikuGenerationStickyNoteShell } from "./HaikuGenerationStickyNoteShell";
import { ThemeStage } from "../storybook/themeStage";

const meta: Meta<typeof HaikuGenerationStickyNoteShell> = {
  title: "Archive/Haiku/HaikuGenerationStickyNoteShell",
  component: HaikuGenerationStickyNoteShell,
  args: {
    title: "Autumn wind",
    meta: "2:30 PM",
    body: "Leaves fall —\nSilence gathers on the path,\nWinter waits ahead.",
  },
};

export default meta;
type Story = StoryObj<typeof HaikuGenerationStickyNoteShell>;

export const Default: Story = {};

export const WithActionsSlot: Story = {
  args: {
    actions: <button type="button">⋯</button>,
    footer: <span style={{ fontSize: "0.75rem" }}>Footer slot</span>,
  },
};

export const ThemeNightSky: Story = {
  render: (args) => (
    <ThemeStage theme="night-sky">
      <HaikuGenerationStickyNoteShell {...args} />
    </ThemeStage>
  ),
};

export const ThemeTokyoDusk: Story = {
  render: (args) => (
    <ThemeStage theme="tokyo-dusk">
      <HaikuGenerationStickyNoteShell {...args} />
    </ThemeStage>
  ),
};

export const ThemeSumie: Story = {
  render: (args) => (
    <ThemeStage theme="sumie">
      <HaikuGenerationStickyNoteShell {...args} />
    </ThemeStage>
  ),
};

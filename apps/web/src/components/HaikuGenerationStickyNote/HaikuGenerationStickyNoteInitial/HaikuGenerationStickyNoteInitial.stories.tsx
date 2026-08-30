import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HaikuGenerationStickyNoteInitial } from "./HaikuGenerationStickyNoteInitial";
import { INITIAL_HAIKU_TEXT } from "../constants";

const meta: Meta<typeof HaikuGenerationStickyNoteInitial> = {
  title: "Archive/Haiku/HaikuGenerationStickyNoteInitial",
  component: HaikuGenerationStickyNoteInitial,
  args: {
    text: INITIAL_HAIKU_TEXT,
  },
};

export default meta;
type Story = StoryObj<typeof HaikuGenerationStickyNoteInitial>;

export const TypingOnMount: Story = {};

export const FullyTyped: Story = {
  parameters: {
    chromatic: { delay: 3000 },
  },
};

export const FlyingAway: Story = {
  args: {
    washingOut: true,
  },
  render: (args) => <HaikuGenerationStickyNoteInitial key="fly-away" {...args} />,
};

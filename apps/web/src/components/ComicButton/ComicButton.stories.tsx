import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { COMIC_SOURCE_DIRECTIONS } from "../ComicConfirmModal/comicSourceDirection";
import { ComicButton } from "./ComicButton";

const meta = {
  title: "Haiku/ComicButton",
  component: ComicButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Leave it be",
    bubbleStyle: "speech",
    sourceDirection: "none",
  },
} satisfies Meta<typeof ComicButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BottomLeft: Story = {
  args: {
    sourceDirection: "bottom-left",
    children: "Retry",
  },
};

export const BottomRight: Story = {
  args: {
    sourceDirection: "bottom-right",
    children: "Continue",
  },
};

export const TopLeft: Story = {
  args: {
    sourceDirection: "top-left",
    children: "Look up!",
  },
};

export const ShoutBottomRight: Story = {
  args: {
    bubbleStyle: "shout",
    sourceDirection: "bottom-right",
    children: "Delete!",
  },
};

export const ThoughtTop: Story = {
  args: {
    bubbleStyle: "thought",
    sourceDirection: "top",
    children: "Hmm…",
  },
};

export const AllDirections: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
        gap: "1.25rem",
        width: "min(100%, 52rem)",
      }}
    >
      {COMIC_SOURCE_DIRECTIONS.map((direction) => (
        <ComicButton key={direction} sourceDirection={direction}>
          {direction}
        </ComicButton>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    sourceDirection: "bottom-left",
    children: "Unavailable",
  },
};

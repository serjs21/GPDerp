import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { COMIC_SOURCE_DIRECTIONS } from "../ComicConfirmModal/comicSourceDirection";
import { ComicDialogContent } from "./ComicDialogContent";

const meta = {
  title: "Haiku/ComicDialogContent",
  component: ComicDialogContent,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Delete this haiku?",
    bubbleStyle: "pointedArcs",
    sourceDirection: "none",
  },
} satisfies Meta<typeof ComicDialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Speech: Story = {
  args: {
    bubbleStyle: "speech",
    children: "Are you sure?",
  },
};

export const Thought: Story = {
  args: {
    bubbleStyle: "thought",
    children: "Hmm… what now?",
  },
};

export const BottomLeft: Story = {
  args: {
    sourceDirection: "bottom-left",
    children: "Look here!",
  },
};

export const AllDirections: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
        gap: "1.25rem",
        width: "min(100%, 52rem)",
      }}
    >
      {COMIC_SOURCE_DIRECTIONS.map((direction) => (
        <ComicDialogContent key={direction} sourceDirection={direction}>
          {direction}
        </ComicDialogContent>
      ))}
    </div>
  ),
};

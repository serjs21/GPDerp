import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { COMIC_BUBBLE_STYLES } from "./comicBubblePresets";
import { ComicBubblePreview } from "./ComicBubblePreview";

const meta = {
  title: "Haiku/ComicConfirmModal/BubbleStyles",
  component: ComicBubblePreview,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Look here!",
    bubbleStyle: "pointedArcs",
  },
} satisfies Meta<typeof ComicBubblePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QuestionSpeech: Story = {
  args: { bubbleStyle: "speech", label: "Are you sure?" },
};

export const QuestionThought: Story = {
  args: { bubbleStyle: "thought", label: "Hmm… what now?" },
};

export const QuestionCircle: Story = {
  args: { bubbleStyle: "circle", label: "Really?" },
};

export const QuestionRectangle: Story = {
  args: { bubbleStyle: "rectangle", label: "Confirm action" },
};

export const QuestionCaption: Story = {
  args: { bubbleStyle: "caption", label: "A quiet note" },
};

export const QuestionPointedArcs: Story = {
  args: { bubbleStyle: "pointedArcs", label: "Look here!" },
};

export const AllQuestionStyles: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
        gap: "1.25rem",
        width: "min(100%, 56rem)",
      }}
    >
      {COMIC_BUBBLE_STYLES.map((style) => (
        <ComicBubblePreview key={style} bubbleStyle={style} label={`Style: ${style}`} />
      ))}
    </div>
  ),
};

export const CtaStylesRow: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "1rem",
        width: "min(100%, 42rem)",
      }}
    >
      {(["speech", "circle", "rectangle", "pointedArcs"] as const).map((style) => (
        <ComicBubblePreview key={style} bubbleStyle={style} label={style} />
      ))}
    </div>
  ),
};

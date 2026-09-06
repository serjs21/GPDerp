import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EXAMPLE_HAIKU_BODY, makeMockHaiku, withQueryClient } from "@/storybook";
import { HaikuGenerationStickyNoteCard } from "./HaikuGenerationStickyNoteCard";

const meta: Meta<typeof HaikuGenerationStickyNoteCard> = {
  title: "Archive/Haiku/HaikuGenerationStickyNoteCard",
  component: HaikuGenerationStickyNoteCard,
  decorators: [withQueryClient],
};

export default meta;
type Story = StoryObj<typeof HaikuGenerationStickyNoteCard>;

export const GeneratingMidStream: Story = {
  args: {
    generatingDraft: {
      requestId: "story-req-1",
      subject: "Autumn wind",
      content: "Leaves fall —\n",
      createdAtLabel: "2:30 PM",
    },
  },
};

export const Saved: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-1",
      body: EXAMPLE_HAIKU_BODY,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const SavedWithLabels: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-2",
      body: EXAMPLE_HAIKU_BODY,
      title: "Jean-Paul Sartickle",
      labels: [
        { id: "l1", name: "philosophy", color: "blue", shape: "classic" },
        { id: "l2", name: "void", color: "default", shape: "classic" },
      ],
    }),
  },
};

export const ActionsVisible: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-3",
      body: EXAMPLE_HAIKU_BODY,
      title: "Jean-Paul Sartickle",
    }),
  },
  parameters: {
    pseudo: { hover: true },
  },
};

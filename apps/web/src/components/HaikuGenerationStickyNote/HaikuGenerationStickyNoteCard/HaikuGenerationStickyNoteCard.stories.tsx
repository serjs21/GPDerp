import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import { HaikuGenerationStickyNoteCard } from "./HaikuGenerationStickyNoteCard";

function makeMockHaiku(partial: Partial<HaikuDto> & Pick<HaikuDto, "id" | "body">): HaikuDto {
  return {
    title: "Mock subject",
    titleSuffix: 0,
    createdAt: new Date("2026-01-15T12:00:00.000Z").toISOString(),
    accountId: "00000000-0000-4000-8000-000000000001",
    createdById: "00000000-0000-4000-8000-000000000002",
    labels: [],
    ...partial,
  };
}

const exampleBody = `Shadow questions rise,
a void whispers, "Who are you?"
Self slips through the cracks.

-Jean-Paul Sartickle`;

const meta: Meta<typeof HaikuGenerationStickyNoteCard> = {
  title: "Haiku/HaikuGenerationStickyNoteCard",
  component: HaikuGenerationStickyNoteCard,
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
      body: exampleBody,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const SavedWithLabels: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-2",
      body: exampleBody,
      title: "Jean-Paul Sartickle",
      labels: [
        { id: "l1", name: "philosophy", color: "blue" },
        { id: "l2", name: "void", color: "default" },
      ],
    }),
  },
};

export const ActionsVisible: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-3",
      body: exampleBody,
      title: "Jean-Paul Sartickle",
    }),
  },
  parameters: {
    pseudo: { hover: true },
  },
};

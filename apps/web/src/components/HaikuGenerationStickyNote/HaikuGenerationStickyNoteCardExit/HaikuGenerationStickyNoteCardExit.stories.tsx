import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import { HaikuGenerationStickyNoteCardExit } from "./HaikuGenerationStickyNoteCardExit";

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

const meta: Meta<typeof HaikuGenerationStickyNoteCardExit> = {
  title: "Haiku/HaikuGenerationStickyNoteCardExit",
  component: HaikuGenerationStickyNoteCardExit,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof HaikuGenerationStickyNoteCardExit>;

export const Saved: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-exit-haiku-1",
      body: exampleBody,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const GeneratingPassthrough: Story = {
  args: {
    generatingDraft: {
      requestId: "story-exit-req-1",
      subject: "Autumn wind",
      content: "Leaves fall —\n",
      createdAtLabel: "2:30 PM",
    },
  },
};

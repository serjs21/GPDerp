import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EXAMPLE_HAIKU_BODY, makeMockHaiku, withQueryClient } from "@/storybook";
import { HaikuGenerationStickyNoteCardExit } from "./HaikuGenerationStickyNoteCardExit";

const meta: Meta<typeof HaikuGenerationStickyNoteCardExit> = {
  title: "Haiku/HaikuGenerationStickyNoteCardExit",
  component: HaikuGenerationStickyNoteCardExit,
  decorators: [withQueryClient],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof HaikuGenerationStickyNoteCardExit>;

export const Saved: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-exit-haiku-1",
      body: EXAMPLE_HAIKU_BODY,
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

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef } from "react";
import type { HaikuDto } from "@/api/haikus";
import { makeMockHaiku, TEXT_STREAM_STYLE_HAIKUS, withQueryClient } from "@/storybook";
import { SavedHaikusListView } from "@/components/SavedHaikusList/SavedHaikusList";
import { HaikuGenerationStickyNoteCard } from "../HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import { haikuGenerationStickyNoteListStyles } from "./HaikuGenerationStickyNoteList";

const exampleHaikus: HaikuDto[] = TEXT_STREAM_STYLE_HAIKUS.map((body, i) =>
  makeMockHaiku({
    id: `story-haiku-${i}`,
    body,
    title: ["Jean-Paul Sartickle", "Holy Ghostwriter"][i] ?? `Haiku ${i + 1}`,
  }),
);

const ListPreview = (
  props: Omit<React.ComponentProps<typeof SavedHaikusListView>, "scrollRootRef">,
) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={scrollRef} className={haikuGenerationStickyNoteListStyles.scrollArea}>
      <SavedHaikusListView
        {...props}
        scrollRootRef={scrollRef}
        HaikuCardComponent={HaikuGenerationStickyNoteCard}
        showEmptyMessage={false}
        embedded
      />
    </div>
  );
};

const meta: Meta<typeof ListPreview> = {
  title: "Haiku/HaikuGenerationStickyNoteList",
  component: ListPreview,
  decorators: [withQueryClient],
  args: {
    onLoadMore: () => undefined,
    onRetry: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ListPreview>;

export const Empty: Story = {
  args: {
    haikus: [],
    isInitialLoading: false,
    isFetchingNextPage: false,
    isError: false,
    hasNextPage: false,
  },
};

export const WithExamples: Story = {
  args: {
    haikus: exampleHaikus,
    isInitialLoading: false,
    isFetchingNextPage: false,
    isError: false,
    hasNextPage: true,
  },
};

export const WithGeneratingDraft: Story = {
  args: {
    haikus: exampleHaikus,
    generatingDraft: {
      requestId: "story-req-1",
      subject: "Autumn wind",
      content: "Leaves fall —\n",
      createdAtLabel: "2:30 PM",
    },
    isInitialLoading: false,
    isFetchingNextPage: false,
    isError: false,
    hasNextPage: true,
  },
};

export const WithLabels: Story = {
  args: {
    haikus: [
      makeMockHaiku({
        id: "labeled-1",
        body: exampleHaikus[0].body,
        title: "Jean-Paul Sartickle",
        labels: [
          { id: "l1", name: "philosophy", color: "blue" },
          { id: "l2", name: "existential", color: "green" },
        ],
      }),
      ...exampleHaikus.slice(1),
    ],
    isInitialLoading: false,
    isFetchingNextPage: false,
    isError: false,
    hasNextPage: false,
  },
};

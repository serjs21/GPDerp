import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { HaikuDto } from "@/api/haikus";
import { SavedHaikusListView } from "@/components/SavedHaikusList/SavedHaikusList";
import { HaikuGenerationStickyNoteCard } from "../HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import { haikuGenerationStickyNoteListStyles } from "./HaikuGenerationStickyNoteList";

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

const TEXT_STREAM_STYLE_HAIKUS = [
  `Shadow questions rise,
a void whispers, "Who are you?"
Self slips through the cracks.

-Jean-Paul Sartickle`,

  `Nietzsche's whisper fades,
Empty sky and silent bells—
Doubt's garden grows wild.

—Holy Ghostwriter`,
];

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
  decorators: [
    (Story) => {
      const qc = new QueryClient();
      return (
        <QueryClientProvider client={qc}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
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

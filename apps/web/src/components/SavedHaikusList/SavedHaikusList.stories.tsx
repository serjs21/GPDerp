import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { makeMockHaiku, TEXT_STREAM_STYLE_HAIKUS, withQueryClient } from "@/storybook";
import { SavedHaikusListView } from "./SavedHaikusList";

const meta: Meta<typeof SavedHaikusListView> = {
  title: "Haiku/SavedHaikusList",
  component: SavedHaikusListView,
  decorators: [withQueryClient],
  args: {
    onLoadMore: () => undefined,
    onRetry: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof SavedHaikusListView>;

const exampleHaikus: HaikuDto[] = TEXT_STREAM_STYLE_HAIKUS.map((body, i) =>
  makeMockHaiku({
    id: `story-haiku-${i}`,
    body,
    title: ["Jean-Paul Sartickle", "Holy Ghostwriter", "Dante Fuego"][i] ?? `Haiku ${i + 1}`,
    titleSuffix: 0,
  }),
);

const midGenerationDraft: GeneratingDraft = {
  requestId: "story-req-1",
  subject: "Autumn wind",
  content: "Leaves fall —\n",
  createdAtLabel: "2:30 PM",
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
    generatingDraft: midGenerationDraft,
    isInitialLoading: false,
    isFetchingNextPage: false,
    isError: false,
    hasNextPage: true,
  },
};

export const LoadingFirstPage: Story = {
  args: {
    haikus: [],
    isInitialLoading: true,
    isFetchingNextPage: false,
    isError: false,
    hasNextPage: false,
  },
};

export const LoadingNextPage: Story = {
  args: {
    haikus: exampleHaikus.slice(0, 1),
    isInitialLoading: false,
    isFetchingNextPage: true,
    isError: false,
    hasNextPage: true,
  },
};

export const Empty: Story = {
  args: {
    haikus: [],
    isInitialLoading: false,
    isFetchingNextPage: false,
    isError: false,
    hasNextPage: false,
  },
};

export const NetworkError: Story = {
  args: {
    haikus: [],
    isInitialLoading: false,
    isFetchingNextPage: false,
    isError: true,
    hasNextPage: false,
  },
};

export const ErrorWithPartialList: Story = {
  args: {
    haikus: exampleHaikus.slice(0, 2),
    isInitialLoading: false,
    isFetchingNextPage: false,
    isError: true,
    hasNextPage: true,
  },
};

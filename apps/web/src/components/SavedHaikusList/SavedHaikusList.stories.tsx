import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import { SavedHaikusListView } from "./SavedHaikusList";

/**
 * Sample bodies aligned with `apps/api/src/mocks/textStream.ts` (HAIKUS array).
 */
const TEXT_STREAM_STYLE_HAIKUS = [
  `Shadow questions rise,
a void whispers, "Who are you?"
Self slips through the cracks.

-Jean-Paul Sartickle`,

  `Nietzsche’s whisper fades,
Empty sky and silent bells—
Doubt’s garden grows wild.

—Holy Ghostwriter`,

  `Infernal flames burn,
Whispers echo endless pain—
Hope lost to the void.

— Dante Fuego`,
];

function makeMockHaiku(partial: Partial<HaikuDto> & Pick<HaikuDto, "id" | "body">): HaikuDto {
  return {
    title: "Mock subject",
    titleSuffix: 0,
    createdAt: new Date("2026-01-15T12:00:00.000Z").toISOString(),
    accountId: "00000000-0000-4000-8000-000000000001",
    createdById: "00000000-0000-4000-8000-000000000002",
    ...partial,
  };
}

const meta: Meta<typeof SavedHaikusListView> = {
  title: "Haiku/SavedHaikusList",
  component: SavedHaikusListView,
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

export const WithExamples: Story = {
  args: {
    haikus: exampleHaikus,
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

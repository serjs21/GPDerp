import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import { AuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import { HaikuGenerationStickyNoteCard } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import { SakuraPetalLoader } from "@/components/Loaders";
import { fn } from "storybook/test";
import { WisdomForest } from "./WisdomForest";
import { WisdomForestStoryStage } from "./WisdomForestStoryStage";

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

const BODIES = [
  `Shadow questions rise,\na void whispers, "Who are you?"\nSelf slips through the cracks.\n\n-Jean-Paul Sartickle`,
  `Nietzsche's whisper fades,\nEmpty sky and silent bells—\nDoubt's garden grows wild.\n\n—Holy Ghostwriter`,
  `Moonlit pine branch,\nstillness holds the winter pond—\nfrog leaps, rings expand.\n\n—Basho`,
  `Cherry blossoms fall,\nsoft petals on still water—\nspring remembers all.\n\n—Matsuo`,
  `Autumn wind whispers,\nleaves surrender to the earth—\ntime folds into gold.\n\n—Yosa`,
  `Silent temple bell,\nechoes fade in mountain mist—\ndawn breaks without sound.\n\n—Ryokan`,
];

const mockHaikus: HaikuDto[] = BODIES.map((body, i) =>
  makeMockHaiku({
    id: `wisdom-forest-${i}`,
    body,
    title: `Haiku ${i + 1}`,
    createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  }),
);

const storyDefaults = {
  PreviewCard: HaikuGenerationStickyNoteCard,
  Loader: SakuraPetalLoader,
  onLoadMore: fn(),
  onRetry: fn(),
  height: "60vh",
  width: "100%",
  haikus: mockHaikus,
  isInitialLoading: false,
  isFetchingNextPage: false,
  isError: false,
  hasNextPage: true,
};

function storyProviders(Story: () => ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={qc}>
      <AuthenticationProvider>
        <AuthenticationVerificationProvider>
          <div style={{ padding: "1.5rem", maxWidth: "48rem", margin: "0 auto" }}>
            <Story />
          </div>
        </AuthenticationVerificationProvider>
      </AuthenticationProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "Components/WisdomForest",
  component: WisdomForest,
  parameters: { layout: "fullscreen" },
  decorators: [storyProviders],
  args: storyDefaults,
} satisfies Meta<typeof WisdomForest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StackingPreview: Story = {
  render: (args) => <WisdomForestStoryStage {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Cody House sticky stack: cards stick with padding-top tabs visible behind the front card; scroll-driven scale matches the official demo.",
      },
    },
  },
};

export const DepthWalkthrough: Story = {
  render: (args) => <WisdomForestStoryStage {...args} />,
  args: {
    haikus: mockHaikus.slice(0, 6),
    hasNextPage: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Six cards with scroll-driven scale animation (Chrome 115+). Each card slot matches haiku card height; sticky padding-top forms the stack tabs.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    haikus: [],
    isInitialLoading: true,
    hasNextPage: false,
  },
};

export const WithGeneratingDraft: Story = {
  args: {
    generatingDraft: {
      requestId: "story-req-1",
      subject: "Autumn wind",
      content: "Leaves fall —\n",
      createdAtLabel: "2:30 PM",
    },
    hasNextPage: true,
  },
};

export const Paginating: Story = {
  args: {
    isFetchingNextPage: true,
    hasNextPage: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Sakura loader appears in the card list while the next page loads.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    haikus: [],
    hasNextPage: false,
  },
};

export const ErrorState: Story = {
  args: {
    haikus: [],
    isError: true,
    hasNextPage: false,
  },
};

export const CustomSize: Story = {
  args: {
    height: "80vh",
  },
};

export const CustomLoader: Story = {
  args: {
    Loader: () => <p style={{ margin: 0 }}>Loading more haikus…</p>,
    isFetchingNextPage: true,
  },
};

export const Connected: Story = {
  render: () => <WisdomForest />,
  parameters: {
    docs: {
      description: {
        story:
          "Connected mode (no haikus prop): fetches from the API when logged in. Renders nothing in Storybook unless the session is authenticated.",
      },
    },
  },
};

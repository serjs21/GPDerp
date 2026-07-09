import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import {
  composeDecorators,
  makeMockHaiku,
  withAuthProviders,
  withQueryClient,
  WISDOM_FOREST_BODIES,
} from "@/storybook";
import { HaikuGenerationStickyNoteCard } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import { WisdomBranch } from "@/components/WisdomBranch";
import { SakuraPetalLoader } from "@/components/Loaders";
import { fn } from "storybook/test";
import { WisdomForest } from "./WisdomForest";
import { WisdomForestStoryStage } from "./WisdomForestStoryStage";

const mockHaikus: HaikuDto[] = WISDOM_FOREST_BODIES.map((body, i) =>
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

const meta = {
  title: "Components/WisdomForest",
  component: WisdomForest,
  parameters: { layout: "fullscreen" },
  decorators: [composeDecorators(withQueryClient, withAuthProviders)],
  args: storyDefaults,
} satisfies Meta<typeof WisdomForest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StackingPreview: Story = {
  render: (args) => <WisdomForestStoryStage {...args} />,
  args: {
    PreviewCard: WisdomBranch,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Cody House sticky stack with WisdomBranch sakura-branch preview cards: tabs peek behind the front card; scroll-driven scale matches the official demo.",
      },
    },
  },
};

export const DepthWalkthrough: Story = {
  render: (args) => <WisdomForestStoryStage {...args} />,
  args: {
    PreviewCard: WisdomBranch,
    haikus: mockHaikus.slice(0, 6),
    hasNextPage: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Six WisdomBranch cards with scroll-driven scale animation (Chrome 115+). Each slot matches haiku card height; sticky padding-top forms the stack tabs.",
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

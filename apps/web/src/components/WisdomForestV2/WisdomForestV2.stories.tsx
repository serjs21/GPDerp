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
import { WisdomForestV2 } from "./WisdomForestV2";

const mockHaikus: HaikuDto[] = WISDOM_FOREST_BODIES.map((body, i) =>
  makeMockHaiku({
    id: `wisdom-forest-v2-${i}`,
    body,
    title: `Haiku ${i + 1}`,
    createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  }),
);

const manyHaikus: HaikuDto[] = Array.from({ length: 12 }, (_, i) =>
  makeMockHaiku({
    id: `wisdom-forest-v2-many-${i}`,
    body: WISDOM_FOREST_BODIES[i % WISDOM_FOREST_BODIES.length],
    title: `Haiku ${i + 1}`,
    createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  }),
);

const meta = {
  title: "Components/WisdomForestV2",
  component: WisdomForestV2,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Depth stack v2: latest card first, following cards smaller and higher, exit scroll shrinks with perspective and fades to reveal the next card.",
      },
    },
  },
  decorators: [composeDecorators(withQueryClient, withAuthProviders)],
  args: {
    haikus: mockHaikus,
    PreviewCard: HaikuGenerationStickyNoteCard,
    Loader: SakuraPetalLoader,
    height: "60vh",
    width: "100%",
    hasNextPage: false,
    isFetchingNextPage: false,
    onLoadMore: fn(),
    onActiveCardIndexChange: fn(),
  },
} satisfies Meta<typeof WisdomForestV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithWisdomBranch: Story = {
  args: {
    PreviewCard: WisdomBranch,
  },
  parameters: {
    docs: {
      description: {
        story: "Same depth stack with WisdomBranch preview cards.",
      },
    },
  },
};

export const ScrollDepth: Story = {
  args: {
    haikus: manyHaikus,
  },
  parameters: {
    docs: {
      description: {
        story: "Twelve cards to exercise sticky depth tabs and exit fade.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    haikus: [],
  },
};

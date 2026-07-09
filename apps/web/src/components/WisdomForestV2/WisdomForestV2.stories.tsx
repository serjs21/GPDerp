import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import { AuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import { HaikuGenerationStickyNoteCard } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import { WisdomBranch } from "@/components/WisdomBranch";
import { SakuraPetalLoader } from "@/components/Loaders";
import { fn } from "storybook/test";
import { WisdomForestV2 } from "./WisdomForestV2";

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
    id: `wisdom-forest-v2-${i}`,
    body,
    title: `Haiku ${i + 1}`,
    createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  }),
);

const manyHaikus: HaikuDto[] = Array.from({ length: 12 }, (_, i) =>
  makeMockHaiku({
    id: `wisdom-forest-v2-many-${i}`,
    body: BODIES[i % BODIES.length],
    title: `Haiku ${i + 1}`,
    createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  }),
);

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
  decorators: [storyProviders],
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

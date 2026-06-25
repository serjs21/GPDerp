import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { CSSProperties, ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import { ThemeStage } from "@/components/HaikuGenerationStickyNote/storybook/themeStage";
import { WisdomBranch } from "./WisdomBranch";

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

const autumnBody = `Leaves fall —
Silence gathers on the path,
Winter waits ahead.`;

function storyProviders(Story: () => ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={qc}>
      <Story />
    </QueryClientProvider>
  );
}

const meta: Meta<typeof WisdomBranch> = {
  title: "Haiku/WisdomBranch",
  component: WisdomBranch,
  decorators: [storyProviders],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof WisdomBranch>;

export const Saved: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-1",
      body: exampleBody,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const Generating: Story = {
  args: {
    generatingDraft: {
      requestId: "story-req-1",
      subject: "Autumn wind",
      content: "Leaves fall —\n",
      createdAtLabel: "2:30 PM",
    },
  },
};

export const WithoutAuthor: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-2",
      body: autumnBody,
      title: "Evening breeze",
    }),
  },
};

export const TiltVariants: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        padding: "2rem",
        justifyContent: "center",
      }}
    >
      <WisdomBranch
        angle={-12}
        scale={0.9}
        haiku={makeMockHaiku({
          id: "tilt-gentle",
          body: autumnBody,
          title: "Gentle breeze",
        })}
      />
      <WisdomBranch
        angle={8}
        scale={1}
        haiku={makeMockHaiku({
          id: "tilt-default",
          body: exampleBody,
          title: "Default tilt",
        })}
      />
      <WisdomBranch
        angle={16}
        scale={1.1}
        haiku={makeMockHaiku({
          id: "tilt-drooping",
          body: `Cherry blossoms fall,\nsoft petals on still water—\nspring remembers all.`,
          title: "Drooping branch",
        })}
      />
    </div>
  ),
};

export const ThemeNightSky: Story = {
  render: (args) => (
    <ThemeStage theme="night-sky">
      <WisdomBranch {...args} />
    </ThemeStage>
  ),
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-3",
      body: exampleBody,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const ThemeSumie: Story = {
  render: (args) => (
    <ThemeStage theme="sumie">
      <div style={{ padding: "2rem" } as CSSProperties}>
        <WisdomBranch {...args} />
      </div>
    </ThemeStage>
  ),
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-4",
      body: exampleBody,
      title: "Jean-Paul Sartickle",
    }),
  },
};

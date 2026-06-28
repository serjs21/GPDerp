import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { HaikuDto } from "@/api/haikus";
import type { ThemeName } from "@/config/userConfiguration";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { WisdomBranchStoryStage } from "./storybook/WisdomBranchStoryStage";
import { WisdomBranch } from "./WisdomBranch";
import styles from "./WisdomBranch.stories.module.css";

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

type StoryStageParameters = {
  initialTheme?: ThemeName;
  initialCelestialMode?: boolean;
  initialCelestialPreset?: CelestialPresetName;
};

const withStoryStage: Decorator = (Story, { parameters }) => {
  const stageParams = parameters as StoryStageParameters;
  const initialTheme = stageParams.initialTheme ?? "tokyo-dusk";
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={qc}>
      <WisdomBranchStoryStage
        initialTheme={initialTheme}
        initialCelestialMode={stageParams.initialCelestialMode}
        initialCelestialPreset={stageParams.initialCelestialPreset}
      >
        <Story />
      </WisdomBranchStoryStage>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof WisdomBranch> = {
  title: "Haiku/WisdomBranch",
  component: WisdomBranch,
  decorators: [withStoryStage],
  parameters: {
    layout: "fullscreen",
    initialTheme: "tokyo-dusk" satisfies ThemeName,
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
  render: () => (
    <div className={styles.gallery}>
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

export const NightSky: Story = {
  parameters: { initialTheme: "night-sky" satisfies ThemeName },
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-3",
      body: exampleBody,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const Sumie: Story = {
  parameters: { initialTheme: "sumie" satisfies ThemeName },
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-4",
      body: exampleBody,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const CelestialPreDawn: Story = {
  parameters: {
    initialCelestialMode: true,
    initialCelestialPreset: "preDawn" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-pre-dawn",
      body: exampleBody,
      title: "Pre-dawn branch",
    }),
  },
};

export const CelestialSunrise: Story = {
  parameters: {
    initialCelestialMode: true,
    initialCelestialPreset: "sunrise" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-sunrise",
      body: exampleBody,
      title: "Sunrise branch",
    }),
  },
};

export const CelestialDay: Story = {
  parameters: {
    initialCelestialMode: true,
    initialCelestialPreset: "day" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-day",
      body: exampleBody,
      title: "Midday branch",
    }),
  },
};

export const CelestialGoldenHour: Story = {
  parameters: {
    initialCelestialMode: true,
    initialCelestialPreset: "goldenHour" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-golden-hour",
      body: exampleBody,
      title: "Golden hour branch",
    }),
  },
};

export const CelestialSunset: Story = {
  parameters: {
    initialCelestialMode: true,
    initialCelestialPreset: "sunset" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-sunset",
      body: exampleBody,
      title: "Sunset branch",
    }),
  },
};

export const CelestialBlueNight: Story = {
  parameters: {
    initialCelestialMode: true,
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-blue-night",
      body: exampleBody,
      title: "Blue night branch",
    }),
  },
};

export const CelestialDeepNight: Story = {
  parameters: {
    initialCelestialMode: true,
    initialCelestialPreset: "deepNight" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-deep-night",
      body: exampleBody,
      title: "Deep night branch",
    }),
  },
};

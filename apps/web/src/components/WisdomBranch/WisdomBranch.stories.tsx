import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  AUTUMN_HAIKU_BODY,
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { WisdomBranch } from "./WisdomBranch";
import styles from "./WisdomBranch.stories.module.css";

const meta: Meta<typeof WisdomBranch> = {
  title: "Haiku/WisdomBranch",
  component: WisdomBranch,
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "goldenHour" satisfies CelestialPresetName,
  },
};

export default meta;
type Story = StoryObj<typeof WisdomBranch>;

export const Saved: Story = {
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-1",
      body: EXAMPLE_HAIKU_BODY,
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
      body: AUTUMN_HAIKU_BODY,
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
          body: AUTUMN_HAIKU_BODY,
          title: "Gentle breeze",
        })}
      />
      <WisdomBranch
        angle={8}
        scale={1}
        haiku={makeMockHaiku({
          id: "tilt-default",
          body: EXAMPLE_HAIKU_BODY,
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
  parameters: { initialCelestialPreset: "deepNight" satisfies CelestialPresetName },
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-3",
      body: EXAMPLE_HAIKU_BODY,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const Day: Story = {
  parameters: { initialCelestialPreset: "day" satisfies CelestialPresetName },
  args: {
    haiku: makeMockHaiku({
      id: "story-haiku-4",
      body: EXAMPLE_HAIKU_BODY,
      title: "Jean-Paul Sartickle",
    }),
  },
};

export const CelestialPreDawn: Story = {
  parameters: {
    initialCelestialPreset: "preDawn" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-pre-dawn",
      body: EXAMPLE_HAIKU_BODY,
      title: "Pre-dawn branch",
    }),
  },
};

export const CelestialSunrise: Story = {
  parameters: {
    initialCelestialPreset: "sunrise" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-sunrise",
      body: EXAMPLE_HAIKU_BODY,
      title: "Sunrise branch",
    }),
  },
};

export const CelestialDay: Story = {
  parameters: {
    initialCelestialPreset: "day" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-day",
      body: EXAMPLE_HAIKU_BODY,
      title: "Midday branch",
    }),
  },
};

export const CelestialGoldenHour: Story = {
  parameters: {
    initialCelestialPreset: "goldenHour" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-golden-hour",
      body: EXAMPLE_HAIKU_BODY,
      title: "Golden hour branch",
    }),
  },
};

export const CelestialSunset: Story = {
  parameters: {
    initialCelestialPreset: "sunset" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-sunset",
      body: EXAMPLE_HAIKU_BODY,
      title: "Sunset branch",
    }),
  },
};

export const CelestialBlueNight: Story = {
  parameters: {
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-blue-night",
      body: EXAMPLE_HAIKU_BODY,
      title: "Blue night branch",
    }),
  },
};

export const CelestialDeepNight: Story = {
  parameters: {
    initialCelestialPreset: "deepNight" satisfies CelestialPresetName,
  },
  args: {
    haiku: makeMockHaiku({
      id: "celestial-deep-night",
      body: EXAMPLE_HAIKU_BODY,
      title: "Deep night branch",
    }),
  },
};

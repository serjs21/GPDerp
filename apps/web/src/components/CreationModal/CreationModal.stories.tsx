import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { HomePageContent } from "@/app/HomePageContent";
import { Button } from "@/components/StyledComponents";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
} from "@/storybook";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { CreationModal } from "./CreationModal";
import styles from "./CreationModal.stories.module.css";

const MOCK_DRAFT_PARTIAL: GeneratingDraft = {
  requestId: "story-req-generating",
  subject: "Morning mist",
  content: "Leaves fall —\n",
  createdAtLabel: "2:30 PM",
};

const MOCK_DRAFT_STREAMING: GeneratingDraft = {
  requestId: "story-req-streaming",
  subject: "Empty sky",
  content: `Nietzsche's whisper fades,
Empty sky and silent bells—
`,
  createdAtLabel: "7:21 PM",
};

const MOCK_SAVED = makeMockHaiku({
  id: "story-creation-saved",
  title: "Night questions",
  body: EXAMPLE_HAIKU_BODY,
  createdAt: STORY_CREATED_AT,
});

const meta = {
  title: "Haiku/CreationModal",
  component: CreationModal,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  decorators: [withLoggedInAppLayout],
  args: {
    open: true,
    onKeepScrolling: () => undefined,
    onGoToHaiku: () => undefined,
    generatingDraft: MOCK_DRAFT_PARTIAL,
    haiku: null,
  },
} satisfies Meta<typeof CreationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Generating: Story = {
  render: (args) => (
    <>
      <HomePageContent />
      <CreationModal {...args} />
    </>
  ),
};

export const Streaming: Story = {
  args: {
    generatingDraft: MOCK_DRAFT_STREAMING,
  },
  render: (args) => (
    <>
      <HomePageContent />
      <CreationModal {...args} />
    </>
  ),
};

export const Saved: Story = {
  args: {
    generatingDraft: null,
    haiku: MOCK_SAVED,
  },
  render: (args) => (
    <>
      <HomePageContent />
      <CreationModal {...args} />
    </>
  ),
};

export const Closed: Story = {
  args: {
    open: false,
  },
  render: (args) => (
    <>
      <HomePageContent />
      <CreationModal {...args} />
    </>
  ),
};

export const Interactive: Story = {
  render: function InteractiveStory(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <HomePageContent />
        <div className={styles.appViewToggle}>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open CreationModal
          </Button>
        </div>
        <CreationModal
          {...args}
          open={open}
          onKeepScrolling={() => setOpen(false)}
          onGoToHaiku={() => setOpen(false)}
        />
      </>
    );
  },
};

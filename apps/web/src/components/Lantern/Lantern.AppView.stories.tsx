"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomePageContent } from "@/app/HomePageContent";
import pageStyles from "@/app/page.module.css";
import { HaikuGenerationStickyNoteInput } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteInput/HaikuGenerationStickyNoteInput";
import displayStyles from "@/components/HaikuDisplay/HaikuDisplay.module.css";
import { SVGPath } from "@/components/SVGPath";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  STORY_APP_VIEW_HAIKUS,
  withLoggedInAppLayout,
} from "@/storybook/decorators/withLoggedInAppLayout";

const meta: Meta<typeof HomePageContent> = {
  title: "Haiku/Lantern",
  component: HomePageContent,
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
};

export default meta;
type Story = StoryObj<typeof HomePageContent>;

export const AppView: Story = {};

function AppViewSplitPathContent() {
  const [subject, setSubject] = useState("");

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.paperPlaneFlyLayer} data-paper-plane-background aria-hidden />
      <main className={pageStyles.main}>
        <div className={displayStyles.wrapper}>
          <div className={displayStyles.displayArea}>
            <SVGPath haikus={STORY_APP_VIEW_HAIKUS} showGuides />
          </div>
          <div className={`${displayStyles.inputSection} ${displayStyles.inputSectionBottom}`}>
            <HaikuGenerationStickyNoteInput
              subject={subject}
              onSubjectChange={setSubject}
              onSubmit={(event) => event.preventDefault()}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export const AppViewSplitPath: Story = {
  name: "App view (split path)",
  render: () => <AppViewSplitPathContent />,
};

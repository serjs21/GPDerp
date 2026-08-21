"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomePageContent } from "@/app/HomePageContent";
import { Button } from "@/components/StyledComponents";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { EXAMPLE_HAIKU_BODY, makeMockHaiku } from "@/storybook";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import { PathOverlay } from "./PathOverlay";
import styles from "./PathOverlay.stories.module.css";

const MOCK_HAIKU = makeMockHaiku({
  id: "path-overlay-app-view-lantern",
  title: "Night questions",
  body: EXAMPLE_HAIKU_BODY,
});

const meta = {
  title: "Haiku/PathOverlay",
  component: PathOverlay,
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
} satisfies Meta<typeof PathOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Yin–yang S-curve overlay: left (dark) Keep scrolling, right (light) Go back to the beginning.
 * Centered lantern; halves are the CTAs.
 */
export const OnAppView: Story = {
  name: "On App view",
  args: {
    open: false,
    onClose: () => undefined,
  },
  render: function PathOverlayOnAppViewStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <HomePageContent />
        <div className={styles.appViewToggle}>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open overlay
          </Button>
        </div>
        <PathOverlay
          open={open}
          onKeepScrolling={() => setOpen(false)}
          onGoToBeginning={() => setOpen(false)}
          onClose={() => setOpen(false)}
        >
          <LanternFrame ariaLabel={`Haiku lantern: ${MOCK_HAIKU.title}`} widthRem={14}>
            <Lantern haiku={MOCK_HAIKU} showActions={false} />
          </LanternFrame>
        </PathOverlay>
      </>
    );
  },
};

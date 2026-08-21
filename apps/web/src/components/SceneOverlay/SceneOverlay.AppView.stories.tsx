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
import { SceneOverlay } from "./SceneOverlay";
import styles from "./SceneOverlay.stories.module.css";

const MOCK_HAIKU = makeMockHaiku({
  id: "scene-overlay-app-view-lantern",
  title: "Night questions",
  body: EXAMPLE_HAIKU_BODY,
});

const meta = {
  title: "Haiku/SceneOverlay",
  component: SceneOverlay,
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
} satisfies Meta<typeof SceneOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Vignette overlay + lantern on the same app chrome / background as Haiku/Lantern › App view.
 * Toggle open/close to preview enter/exit animation.
 */
export const VignetteOnAppView: Story = {
  name: "Vignette on App view",
  args: {
    open: false,
    appearance: "vignette",
    closeOnScrimClick: true,
    onClose: () => undefined,
  },
  render: function VignetteOnAppViewStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <HomePageContent />
        <div className={styles.appViewToggle}>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open overlay
          </Button>
        </div>
        <SceneOverlay
          open={open}
          appearance="vignette"
          closeOnScrimClick
          onClose={() => setOpen(false)}
        >
          <LanternFrame ariaLabel={`Haiku lantern: ${MOCK_HAIKU.title}`} widthRem={14}>
            <Lantern haiku={MOCK_HAIKU} showActions={false} />
          </LanternFrame>
          <div className={styles.actions}>
            <Button onClick={() => setOpen(false)}>Keep scrolling</Button>
            <Button type="primary" onClick={() => setOpen(false)}>
              Go back to the beginning
            </Button>
          </div>
        </SceneOverlay>
      </>
    );
  },
};

/**
 * Yin–yang S-curve overlay: left (dark) Keep scrolling, right (light) Go back to the beginning.
 * Centered lantern; halves are the CTAs (no footer buttons).
 */
export const YinYangOnAppView: Story = {
  name: "YinYang on App view",
  args: {
    open: false,
    appearance: "yinYang",
    closeOnScrimClick: false,
    onClose: () => undefined,
  },
  render: function YinYangOnAppViewStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <HomePageContent />
        <div className={styles.appViewToggle}>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open overlay
          </Button>
        </div>
        <SceneOverlay
          open={open}
          appearance="yinYang"
          onKeepScrolling={() => setOpen(false)}
          onGoToBeginning={() => setOpen(false)}
          onClose={() => setOpen(false)}
        >
          <LanternFrame ariaLabel={`Haiku lantern: ${MOCK_HAIKU.title}`} widthRem={14}>
            <Lantern haiku={MOCK_HAIKU} showActions={false} />
          </LanternFrame>
        </SceneOverlay>
      </>
    );
  },
};

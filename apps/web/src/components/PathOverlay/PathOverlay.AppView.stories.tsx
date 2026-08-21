"use client";

import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomePageContent } from "@/app/HomePageContent";
import { Button } from "@/components/StyledComponents";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { EXAMPLE_HAIKU_BODY, makeMockHaiku } from "@/storybook";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import {
  PathOverlay,
  type PathOverlayFillOrigin,
  type PathOverlaySeam,
} from "./PathOverlay";
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

function AppViewDemo({
  fillOrigin,
  seam = "sCurve",
}: {
  fillOrigin: PathOverlayFillOrigin;
  seam?: PathOverlaySeam;
}): ReactNode {
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
        fillOrigin={fillOrigin}
        seam={seam}
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
}

/**
 * Fill blooms from viewport center into the S-seam lobes.
 */
export const CenterOnAppView: Story = {
  name: "Center fill on App view",
  args: {
    open: false,
    fillOrigin: "center",
    seam: "sCurve",
    onClose: () => undefined,
  },
  render: () => <AppViewDemo fillOrigin="center" />,
};

/**
 * Dark fills from top-left, light from bottom-right (corner origin).
 */
export const CornersOnAppView: Story = {
  name: "Corners fill on App view",
  args: {
    open: false,
    fillOrigin: "corners",
    seam: "sCurve",
    onClose: () => undefined,
  },
  render: () => <AppViewDemo fillOrigin="corners" />,
};

/**
 * Straight vertical midline; dark from top-left, light from bottom-right.
 */
export const StraightCornersOnAppView: Story = {
  name: "Straight split corners on App view",
  args: {
    open: false,
    fillOrigin: "corners",
    seam: "straight",
    onClose: () => undefined,
  },
  render: () => <AppViewDemo fillOrigin="corners" seam="straight" />,
};

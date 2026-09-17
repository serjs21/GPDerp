"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { LanternRotated } from "./LanternRotated";
import type { LanternRotatedVariantId } from "./lanternRotatedContent.config";
import styles from "./Lantern.stories.module.css";

const DEMO_HAIKU = makeMockHaiku({
  id: "lantern-rotated-demo",
  title: "Night questions",
  body: EXAMPLE_HAIKU_BODY,
  createdAt: STORY_CREATED_AT,
});

const meta: Meta<typeof LanternRotated> = {
  title: "Haiku/Lantern/Rotated",
  component: LanternRotated,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
  args: {
    haiku: DEMO_HAIKU,
    showActions: true,
    widthRem: 17.5,
  },
};

export default meta;
type Story = StoryObj<typeof LanternRotated>;

function RotatedStage({
  variant,
}: {
  variant: LanternRotatedVariantId;
}) {
  return (
    <div className={styles.stage}>
      <LanternRotated variant={variant} haiku={DEMO_HAIKU} showActions />
    </div>
  );
}

export const RotatedBase: Story = {
  name: "lantern_base_rotated",
  render: () => <RotatedStage variant="rotated" />,
};

export const RotatedBase2: Story = {
  name: "lanter-base-rotated-2",
  render: () => <RotatedStage variant="rotated2" />,
};

export const Both: Story = {
  render: () => (
    <div className={styles.labelsStage}>
      <div className={styles.labelsSample}>
        <LanternRotated variant="rotated" haiku={DEMO_HAIKU} showActions widthRem={14} />
        <p className={styles.labelsCaption}>lantern_base_rotated</p>
      </div>
      <div className={styles.labelsSample}>
        <LanternRotated variant="rotated2" haiku={DEMO_HAIKU} showActions widthRem={14} />
        <p className={styles.labelsCaption}>lanter-base-rotated-2</p>
      </div>
    </div>
  ),
};

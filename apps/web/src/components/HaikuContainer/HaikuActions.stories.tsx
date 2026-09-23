"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  withMockAuthentication,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { HaikuActions } from "./HaikuActions";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import lanternStoryStyles from "@/components/Lantern/Lantern.stories.module.css";
import styles from "./HaikuActions.stories.module.css";

const DEMO_HAIKU = makeMockHaiku({
  id: "haiku-actions-demo",
  title: "Action bar lantern",
  body: EXAMPLE_HAIKU_BODY,
  createdAt: STORY_CREATED_AT,
});

const meta: Meta<typeof HaikuActions> = {
  title: "Haiku/HaikuActions",
  component: HaikuActions,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [
    composeDecorators(withQueryClient, withMockAuthentication, withThemedStoryStage),
  ],
};

export default meta;
type Story = StoryObj<typeof HaikuActions>;

/** Isolated toggle + dock so forced open/closed states are easy to compare. */
function ToggleShowcase({
  forcedOpen,
  caption,
}: {
  forcedOpen: boolean;
  caption: string;
}) {
  return (
    <div className={styles.sample}>
      <p className={styles.caption}>{caption}</p>
      <LanternFrame
        ariaLabel="Haiku actions demo lantern"
        widthRem={14}
        className={styles.lanternForceActions}
      >
        <Lantern haiku={DEMO_HAIKU} showActions={false} />
        <div className={styles.actionsSlot} data-lantern-actions>
          <HaikuActions variant="saved" haiku={DEMO_HAIKU} forcedOpen={forcedOpen} />
        </div>
      </LanternFrame>
    </div>
  );
}

export const ToggleClosed: Story = {
  name: "Toggle closed",
  render: () => (
    <div className={lanternStoryStyles.stage}>
      <ToggleShowcase forcedOpen={false} caption="actions_closed.svg · bar hidden" />
    </div>
  ),
};

export const ToggleOpen: Story = {
  name: "Toggle open",
  render: () => (
    <div className={lanternStoryStyles.stage}>
      <ToggleShowcase forcedOpen={true} caption="actions_open.svg · bar under lantern" />
    </div>
  ),
};

export const ToggleStates: Story = {
  name: "Toggle closed vs open",
  render: () => (
    <div className={styles.compareStage}>
      <ToggleShowcase forcedOpen={false} caption="Closed" />
      <ToggleShowcase forcedOpen={true} caption="Open" />
    </div>
  ),
};

export const InteractiveOnLantern: Story = {
  name: "Interactive on lantern",
  render: () => (
    <div className={lanternStoryStyles.stage}>
      <div className={styles.sample}>
        <p className={styles.caption}>
          Hover the lantern base (desktop) or tap the toggle — click to open/close the bar
        </p>
        <LanternFrame
          ariaLabel="Interactive haiku actions lantern"
          widthRem={16}
          className={styles.lanternForceActions}
        >
          <Lantern haiku={DEMO_HAIKU} showActions />
        </LanternFrame>
      </div>
    </div>
  ),
};

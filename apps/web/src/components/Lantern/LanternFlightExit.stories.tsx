"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useCallback, useState } from "react";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { Button } from "@/components/StyledComponents";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { Lantern } from "./Lantern";
import { LanternFrame } from "./LanternFrame";
import { LanternSteppedFlight } from "./LanternSteppedFlight";
import type { LanternTransform } from "./lanternTransform";
import styles from "./Lantern.stories.module.css";
import demoStyles from "./LanternFlightExit.stories.module.css";

const DEMO_TRANSFORM: LanternTransform = {
  positionMode: "percent",
  x: 0.5,
  y: 0.70635,
  scale: 1,
  rotate: 0,
  opacity: 1,
};

const DEMO_HAIKU = makeMockHaiku({
  id: "flight-exit-demo",
  title: "Night questions",
  body: EXAMPLE_HAIKU_BODY,
  createdAt: STORY_CREATED_AT,
});

function LanternFlightExitDemo() {
  const [flying, setFlying] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const resetFlight = useCallback(() => {
    setFlying(false);
  }, []);

  const triggerFlight = useCallback(() => {
    setFlying(false);
    setRunKey((key) => key + 1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlying(true);
      });
    });
  }, []);

  return (
    <div className={demoStyles.demo}>
      <Button type="primary" onClick={triggerFlight}>
        Fly away
      </Button>
      <div className={styles.stage}>
        {flying ? (
          <LanternSteppedFlight
            key={runKey}
            haiku={DEMO_HAIKU}
            transform={DEMO_TRANSFORM}
            widthRem={20}
            onComplete={resetFlight}
          />
        ) : (
          <LanternFrame
            ariaLabel="Lantern flight exit demo"
            widthRem={20}
            transform={DEMO_TRANSFORM}
          >
            <Lantern haiku={DEMO_HAIKU} showActions={false} />
          </LanternFrame>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof LanternFlightExitDemo> = {
  title: "Haiku/Lantern/Flight exit",
  component: LanternFlightExitDemo,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
};

export default meta;
type Story = StoryObj<typeof LanternFlightExitDemo>;

export const FlyAway: Story = {
  render: () => <LanternFlightExitDemo />,
};

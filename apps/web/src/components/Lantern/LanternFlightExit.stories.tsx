"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useCallback, useRef, useState, type CSSProperties } from "react";
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
import type { LanternTransform } from "./lanternTransform";
import { initialFlightCssVars, runSteppedLanternFlight } from "./simulateFlight";
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
  const [flightStyle, setFlightStyle] = useState<CSSProperties>(() =>
    initialFlightCssVars("percent"),
  );
  const [flightExiting, setFlightExiting] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const flightCancelRef = useRef<(() => void) | null>(null);

  const resetFlight = useCallback(() => {
    flightCancelRef.current?.();
    flightCancelRef.current = null;
    setFlightExiting(false);
    setFlightStyle(initialFlightCssVars("percent"));
  }, []);

  const triggerFlight = useCallback(() => {
    resetFlight();
    setRunKey((key) => key + 1);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlightExiting(true);
        const { promise, cancel } = runSteppedLanternFlight(
          { positionMode: "percent" },
          setFlightStyle,
        );
        flightCancelRef.current = cancel;
        void promise.then(resetFlight);
      });
    });
  }, [resetFlight]);

  return (
    <div className={demoStyles.demo}>
      <Button type="primary" onClick={triggerFlight}>
        Fly away
      </Button>
      <div className={styles.stage}>
        <LanternFrame
          key={runKey}
          ariaLabel="Lantern flight exit demo"
          widthRem={20}
          transform={DEMO_TRANSFORM}
          style={flightStyle}
          flightExiting={flightExiting}
        >
          <Lantern haiku={DEMO_HAIKU} showActions={false} />
        </LanternFrame>
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

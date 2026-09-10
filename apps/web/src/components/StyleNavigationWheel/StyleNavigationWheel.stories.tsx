import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo, useState, type CSSProperties } from "react";
import { CelestialScene } from "@/components/CelestialScene";
import { StyleNavigationWheel } from "./StyleNavigationWheel";
import { STYLE_NAVIGATION_WHEEL } from "./styleNavigationWheel.config";
import { CELESTIAL_SLOTS_PER_DAY, slotToDate } from "@/theme/celestialTime";
import { getSelectorDialLayoutFromSlot } from "@/theme/celestialSelectorLayout";
import { BANGKOK_COORDINATES, useCelestialScene } from "@/theme/useCelestialScene";
import styles from "./StyleNavigationWheel.stories.module.css";

const meta: Meta<typeof StyleNavigationWheel> = {
  title: "Theme/StyleNavigationWheel",
  component: StyleNavigationWheel,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof StyleNavigationWheel>;

function WheelPreview({
  initialSlot,
  variant,
}: {
  initialSlot: number;
  variant: "panel" | "trigger";
}) {
  const [slot, setSlot] = useState(initialSlot);
  const layout = useMemo(
    () => getSelectorDialLayoutFromSlot(slot, BANGKOK_COORDINATES),
    [slot],
  );
  const scene = useCelestialScene({
    date: slotToDate(slot),
    coordinates: BANGKOK_COORDINATES,
  });
  const { compass, stars, moon } = STYLE_NAVIGATION_WHEEL;

  return (
    <div
      className={styles.stage}
      style={scene.sceneVars as CSSProperties}
    >
      <StyleNavigationWheel layout={layout} slot={slot} variant={variant} />
      <label className={styles.slotLabel}>
        Slot {slot}
        <input
          type="range"
          min={0}
          max={CELESTIAL_SLOTS_PER_DAY - 1}
          value={slot}
          onChange={(event) => setSlot(Number(event.target.value))}
        />
      </label>
      <p className={styles.caption}>
        compass {compass.scale} · stars size {stars.sizePercent}% · stars spin{" "}
        {stars.spinDurationSec}s · moon spin {moon.spinDurationSec}s
      </p>
    </div>
  );
}

export const Panel: Story = {
  render: () => <WheelPreview initialSlot={16} variant="panel" />,
};

export const Trigger: Story = {
  render: () => <WheelPreview initialSlot={16} variant="trigger" />,
};

export const NoonReference: Story = {
  render: () => <WheelPreview initialSlot={48} variant="panel" />,
  parameters: {
    docs: {
      description: {
        story:
          "Slot 48 (noon) → circle base at 0°. Default app slot is 16. Sky uses celestial theme vars.",
      },
    },
  },
};

export const WithCelestialScene: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const [slot, setSlot] = useState(16);
    const layout = useMemo(
      () => getSelectorDialLayoutFromSlot(slot, BANGKOK_COORDINATES),
      [slot],
    );
    const scene = useCelestialScene({
      date: slotToDate(slot),
      coordinates: BANGKOK_COORDINATES,
    });

    return (
      <CelestialScene sceneVars={scene.sceneVars} className={styles.scene}>
        <StyleNavigationWheel layout={layout} slot={slot} variant="panel" />
        <label className={styles.slotLabel} style={{ marginTop: "1rem" }}>
          Slot {slot}
          <input
            type="range"
            min={0}
            max={CELESTIAL_SLOTS_PER_DAY - 1}
            value={slot}
            onChange={(event) => setSlot(Number(event.target.value))}
          />
        </label>
      </CelestialScene>
    );
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo, useState } from "react";
import { StyleNavigationWheel } from "./StyleNavigationWheel";
import { STYLE_NAVIGATION_WHEEL } from "./styleNavigationWheel.config";
import { CELESTIAL_SLOTS_PER_DAY } from "@/theme/celestialTime";
import { getSelectorDialLayoutFromSlot } from "@/theme/celestialSelectorLayout";
import { BANGKOK_COORDINATES } from "@/theme/useCelestialScene";

const meta: Meta<typeof StyleNavigationWheel> = {
  title: "Theme/StyleNavigationWheel",
  component: StyleNavigationWheel,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
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
  const { compass, stars } = STYLE_NAVIGATION_WHEEL;

  return (
    <div style={{ display: "grid", gap: "1rem", justifyItems: "center" }}>
      <StyleNavigationWheel layout={layout} slot={slot} variant={variant} />
      <label style={{ display: "grid", gap: "0.35rem", color: "#eee", fontSize: "0.85rem" }}>
        Slot {slot}
        <input
          type="range"
          min={0}
          max={CELESTIAL_SLOTS_PER_DAY - 1}
          value={slot}
          onChange={(event) => setSlot(Number(event.target.value))}
        />
      </label>
      <p style={{ margin: 0, color: "#aaa", fontSize: "0.75rem", textAlign: "center" }}>
        compass scale {compass.scale} · stars scale {stars.scale} · spin{" "}
        {stars.spinDurationSec}s
      </p>
    </div>
  );
}

export const Panel: Story = {
  render: () => <WheelPreview initialSlot={48} variant="panel" />,
};

export const Trigger: Story = {
  render: () => <WheelPreview initialSlot={72} variant="trigger" />,
};

export const NoonReference: Story = {
  render: () => <WheelPreview initialSlot={48} variant="panel" />,
  parameters: {
    docs: {
      description: {
        story:
          "Slot 48 (noon) → circle base at 0°. Compass + stars share base rotation; stars also self-spin.",
      },
    },
  },
};

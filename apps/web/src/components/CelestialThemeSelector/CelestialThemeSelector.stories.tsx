import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CelestialThemeSelector } from "./CelestialThemeSelector";
import { slotToDate } from "@/theme/celestialTime";
import { BANGKOK_COORDINATES, useCelestialScene } from "@/theme/useCelestialScene";

const meta: Meta<typeof CelestialThemeSelector> = {
  title: "Theme/CelestialThemeSelector",
  component: CelestialThemeSelector,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof CelestialThemeSelector>;

function SelectorStory({
  initialSlot,
  withPreview = false,
}: {
  initialSlot: number;
  withPreview?: boolean;
}) {
  const [slot, setSlot] = useState(initialSlot);
  const [preview, setPreview] = useState<number | null>(null);
  const effectiveSlot = withPreview && preview !== null ? preview : slot;
  const scene = useCelestialScene({
    date: slotToDate(effectiveSlot),
    coordinates: BANGKOK_COORDINATES,
  });

  return (
    <CelestialThemeSelector
      slot={effectiveSlot}
      onChange={setSlot}
      onPreviewChange={withPreview ? setPreview : undefined}
      sceneVars={scene.sceneVars}
    />
  );
}

export const Default: Story = {
  render: () => <SelectorStory initialSlot={48} />,
};

export const DayModeButton: Story = {
  name: "Day mode button",
  render: () => <SelectorStory initialSlot={48} />,
};

export const NightModeButton: Story = {
  name: "Night mode button",
  render: () => <SelectorStory initialSlot={0} />,
};

export const OpenTransition: Story = {
  name: "Open transition",
  render: () => <SelectorStory initialSlot={72} withPreview />,
};

export const Interactive: Story = {
  render: () => <SelectorStory initialSlot={72} withPreview />,
};

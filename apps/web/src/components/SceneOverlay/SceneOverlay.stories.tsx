import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  withThemedStoryStage,
} from "@/storybook";
import { Button } from "@/components/StyledComponents";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import {
  SceneOverlay,
  type SceneOverlayAppearance,
  type SceneOverlayProps,
} from "./SceneOverlay";
import styles from "./SceneOverlay.stories.module.css";

const meta = {
  title: "Haiku/SceneOverlay",
  component: SceneOverlay,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "goldenHour" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withThemedStoryStage)],
  args: {
    open: true,
    appearance: "dim" satisfies SceneOverlayAppearance,
    closeOnScrimClick: true,
    onClose: () => undefined,
  },
} satisfies Meta<typeof SceneOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

function AppearanceDemo({
  appearance,
  label,
  ...rest
}: SceneOverlayProps & { label: string }) {
  return (
    <SceneOverlay appearance={appearance} {...rest}>
      <p className={styles.demoLabel}>{label}</p>
    </SceneOverlay>
  );
}

export const Dim: Story = {
  render: (args) => (
    <AppearanceDemo {...args} appearance="dim" label="Dim appearance" />
  ),
};

export const Blur: Story = {
  render: (args) => (
    <AppearanceDemo {...args} appearance="blur" label="Blur appearance" />
  ),
};

export const Vignette: Story = {
  render: (args) => (
    <AppearanceDemo {...args} appearance="vignette" label="Vignette appearance" />
  ),
};

export const InkWash: Story = {
  render: (args) => (
    <AppearanceDemo {...args} appearance="inkWash" label="Ink wash appearance" />
  ),
};

const MOCK_HAIKU = makeMockHaiku({
  id: "scene-overlay-lantern",
  title: "Night questions",
  body: EXAMPLE_HAIKU_BODY,
});

export const WithLantern: Story = {
  args: {
    appearance: "dim",
    closeOnScrimClick: false,
  },
  render: function WithLanternStory(args) {
    return (
      <SceneOverlay {...args}>
        <LanternFrame ariaLabel={`Haiku lantern: ${MOCK_HAIKU.title}`} widthRem={14}>
          <Lantern haiku={MOCK_HAIKU} showActions={false} />
        </LanternFrame>
        <div className={styles.actions}>
          <Button onClick={args.onClose}>Keep scrolling</Button>
            <Button type="primary" onClick={args.onClose}>
              Go back to the beginning
            </Button>
        </div>
      </SceneOverlay>
    );
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
  render: (args) => (
    <AppearanceDemo {...args} appearance="dim" label="Closed (should be hidden)" />
  ),
};

export const Interactive: Story = {
  render: function InteractiveStory(args) {
    const [open, setOpen] = useState(false);
    return (
      <div className={styles.interactive}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open overlay
        </Button>
        <SceneOverlay
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          appearance={args.appearance ?? "dim"}
        >
          <p className={styles.demoLabel}>Click scrim or press Escape to close</p>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </SceneOverlay>
      </div>
    );
  },
};

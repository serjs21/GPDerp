import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import lanternStoryStyles from "@/components/Lantern/Lantern.stories.module.css";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { composeDecorators, withMockAuthentication, withQueryClient, withThemedStoryStage } from "@/storybook";

const GENERATING_DRAFT = {
  requestId: "story-generating-request",
  subject: "Moon road",
  content: "Moon road over hills\nwhispers to the sleeping pines",
  createdAtLabel: "Just now",
};

/**
 * HaikuActionsGenerating: the "saving" loader in the actions slot of the path lantern that is still
 * generating (GeneratingPathLantern renders this Lantern with actions shown).
 */
const meta = {
  title: "SakuraLoaderPlacesReview/Generating lantern saving",
  component: Lantern,
  decorators: [composeDecorators(withQueryClient, withMockAuthentication, withThemedStoryStage)],
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
} satisfies Meta<typeof Lantern>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Draft streaming into the lantern; the actions slot shows the compact saving loader. */
export const Saving: Story = {
  render: () => (
    <div className={lanternStoryStyles.stage}>
      <LanternFrame ariaLabel="Generating haiku lantern" widthRem={16}>
        <Lantern generatingDraft={GENERATING_DRAFT} showActions />
      </LanternFrame>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { composeDecorators, withThemedStoryStage } from "@/storybook";
import { StoneInput } from "./StoneInput";

const meta: Meta<typeof StoneInput> = {
  title: "Haiku/StoneInput",
  component: StoneInput,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "goldenHour" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withThemedStoryStage)],
  args: {
    subject: "",
    isLoading: false,
    sticky: false,
    onSubmit: (e) => e.preventDefault(),
  },
  argTypes: {
    stickyBottomPx: { control: { type: "number", min: 0, max: 400, step: 8 } },
    stickyStopMarginPx: { control: { type: "number", min: 0, max: 400, step: 8 } },
  },
};

export default meta;
type Story = StoryObj<typeof StoneInput>;

const Controlled = (args: React.ComponentProps<typeof StoneInput>) => {
  const [subject, setSubject] = useState(args.subject);
  return (
    <StoneInput {...args} subject={subject} onSubjectChange={setSubject} />
  );
};

export const Empty: Story = {
  render: (args) => <Controlled {...args} />,
};

export const WithText: Story = {
  args: { subject: "Morning mist" },
  render: (args) => <Controlled {...args} />,
};

export const Loading: Story = {
  args: { subject: "Morning mist", isLoading: true },
  render: (args) => <Controlled {...args} />,
};

export const Disabled: Story = {
  args: { subject: "", isLoading: true },
  render: (args) => <Controlled {...args} />,
};

export const BlueNight: Story = {
  parameters: {
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  args: { subject: "Night questions" },
  render: (args) => <Controlled {...args} />,
};

export const StickyNearBottom: Story = {
  args: {
    subject: "Sticky stone",
    sticky: true,
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "180vh", padding: "2rem 1rem 4rem" }}>
        <p style={{ marginBottom: "40vh", opacity: 0.7 }}>Scroll down — stone sticks 200px from bottom.</p>
        <Story />
        <p style={{ marginTop: "60vh", opacity: 0.7 }}>Page end</p>
      </div>
    ),
  ],
  render: (args) => <Controlled {...args} />,
};

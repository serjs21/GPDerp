import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { composeDecorators, withThemedStoryStage } from "@/storybook";
import { PostSignInput } from "./PostSignInput";

const meta: Meta<typeof PostSignInput> = {
  title: "Haiku/PostSignInput",
  component: PostSignInput,
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
type Story = StoryObj<typeof PostSignInput>;

const Controlled = (args: React.ComponentProps<typeof PostSignInput>) => {
  const [subject, setSubject] = useState(args.subject);
  return (
    <PostSignInput {...args} subject={subject} onSubjectChange={setSubject} />
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
    subject: "Sticky sign",
    sticky: true,
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "180vh", padding: "2rem 1rem 4rem" }}>
        <p style={{ marginBottom: "40vh", opacity: 0.7 }}>Scroll down — sign sticks from the bottom.</p>
        <Story />
        <p style={{ marginTop: "60vh", opacity: 0.7 }}>Page end</p>
      </div>
    ),
  ],
  render: (args) => <Controlled {...args} />,
};

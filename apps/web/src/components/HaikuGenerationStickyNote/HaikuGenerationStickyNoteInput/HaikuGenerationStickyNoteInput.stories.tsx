import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { HaikuGenerationStickyNoteInput } from "./HaikuGenerationStickyNoteInput";

const meta: Meta<typeof HaikuGenerationStickyNoteInput> = {
  title: "Haiku/HaikuGenerationStickyNoteInput",
  component: HaikuGenerationStickyNoteInput,
  args: {
    subject: "",
    isLoading: false,
    onSubmit: (e) => e.preventDefault(),
  },
};

export default meta;
type Story = StoryObj<typeof HaikuGenerationStickyNoteInput>;

const Controlled = (args: React.ComponentProps<typeof HaikuGenerationStickyNoteInput>) => {
  const [subject, setSubject] = useState(args.subject);
  return (
    <HaikuGenerationStickyNoteInput
      {...args}
      subject={subject}
      onSubjectChange={setSubject}
    />
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

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { StoneInput } from "./StoneInput";

const meta: Meta<typeof StoneInput> = {
  title: "Haiku/StoneInput",
  component: StoneInput,
  args: {
    subject: "",
    isLoading: false,
    onSubmit: (e) => e.preventDefault(),
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

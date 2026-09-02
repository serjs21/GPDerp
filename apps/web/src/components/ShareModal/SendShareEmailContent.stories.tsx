import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SendShareEmailContent } from "./SendShareEmailContent";

function SendShareEmailContentStoryShell() {
  return null;
}

const meta = {
  title: "Haiku/SendShareEmailContent",
  component: SendShareEmailContentStoryShell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "32rem", padding: "1rem", background: "#fff" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SendShareEmailContentStoryShell>;

export default meta;
type Story = StoryObj<typeof meta>;

function SendShareEmailContentDemo({
  initialEmails = [] as string[],
  initialMessage = "",
  invalidEmails = [] as string[],
}: {
  initialEmails?: string[];
  initialMessage?: string;
  invalidEmails?: string[];
}) {
  const [emails, setEmails] = useState(initialEmails);
  const [message, setMessage] = useState(initialMessage);

  return (
    <SendShareEmailContent
      emails={emails}
      message={message}
      invalidEmails={invalidEmails}
      onEmailsChange={setEmails}
      onMessageChange={setMessage}
    />
  );
}

export const Default: Story = {
  render: () => <SendShareEmailContentDemo />,
};

export const WithRecipients: Story = {
  render: () => (
    <SendShareEmailContentDemo
      initialEmails={["friend@example.com", "poet@example.org"]}
      initialMessage="Thought you might enjoy this haiku."
    />
  ),
};

export const WithInvalidEmails: Story = {
  render: () => (
    <SendShareEmailContentDemo
      initialEmails={["not-an-email", "valid@example.com"]}
      invalidEmails={["not-an-email"]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <SendShareEmailContent
      emails={["friend@example.com"]}
      message="Sending soon..."
      invalidEmails={[]}
      onEmailsChange={() => undefined}
      onMessageChange={() => undefined}
      disabled
    />
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ShareEmailSendPanel } from "./ShareEmailSendPanel";

function ShareEmailSendPanelStoryShell() {
  return null;
}

const meta = {
  title: "Haiku/ShareEmailSendPanel",
  component: ShareEmailSendPanelStoryShell,
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
} satisfies Meta<typeof ShareEmailSendPanelStoryShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {
  render: () => (
    <ShareEmailSendPanel
      canSendEmail={false}
      sendingEmail={false}
      emailCtaHint="Add at least one recipient email"
      onSendEmail={() => undefined}
    />
  ),
};

export const Ready: Story = {
  render: () => (
    <ShareEmailSendPanel
      canSendEmail
      sendingEmail={false}
      emailCtaHint=""
      onSendEmail={() => undefined}
    />
  ),
};

export const Sending: Story = {
  render: () => (
    <ShareEmailSendPanel
      canSendEmail
      sendingEmail
      emailCtaHint=""
      onSendEmail={() => undefined}
    />
  ),
};

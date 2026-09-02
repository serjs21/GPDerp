import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { ShareLink } from "./ShareLink";

function ShareLinkStoryShell() {
  return null;
}

const baseLink: ShareLinkListItem = {
  id: "11111111-1111-4111-8111-111111111111",
  shareHash: "demo-hash-active",
  shareUrl: "https://example.com/share/demo-hash-active",
  haikuSubject: "Morning mist on the mountain path",
  createdAt: "2026-01-15T10:00:00.000Z",
  expirationDate: null,
  maxViews: null,
  viewCount: 0,
  disabled: false,
};

const meta = {
  title: "Haiku/ShareLink",
  component: ShareLinkStoryShell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "42rem", padding: "1rem", background: "#818181" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShareLinkStoryShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  render: () => <ShareLink link={baseLink} onChanged={() => undefined} />,
};

export const Stopped: Story = {
  render: () => (
    <ShareLink
      link={{ ...baseLink, id: "22222222-2222-4222-8222-222222222222", disabled: true }}
      onChanged={() => undefined}
    />
  ),
};

export const Expired: Story = {
  render: () => (
    <ShareLink
      link={{
        ...baseLink,
        id: "33333333-3333-4333-8333-333333333333",
        expirationDate: "2020-01-01T00:00:00.000Z",
        disabled: false,
      }}
      onChanged={() => undefined}
    />
  ),
};

export const ViewLimitReached: Story = {
  render: () => (
    <ShareLink
      link={{
        ...baseLink,
        id: "44444444-4444-4444-8444-444444444444",
        maxViews: 5,
        viewCount: 5,
        disabled: false,
      }}
      onChanged={() => undefined}
    />
  ),
};

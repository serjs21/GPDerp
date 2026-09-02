import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import type { CreateShareLinkBody, ShareLinkListItem } from "@/api/shareLinks";
import { ShareLink } from "./ShareLink";

const HAIKU_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SUBJECT = "Morning mist on the mountain path";

const baseLink: ShareLinkListItem = {
  id: "11111111-1111-4111-8111-111111111111",
  shareHash: "demo-hash-active",
  shareUrl: "https://example.com/share/demo-hash-active",
  sharedHaikuId: HAIKU_ID,
  haikuSubject: SUBJECT,
  createdAt: "2026-01-15T10:00:00.000Z",
  expirationDate: null,
  maxViews: null,
  viewCount: 0,
  disabled: false,
};

const delayedCreateShareLink = async (_body: CreateShareLinkBody) => {
  await new Promise((r) => setTimeout(r, 2200));
  return { ...baseLink, disabled: false };
};

function ShareLinkStory({
  link,
}: {
  link: ShareLinkListItem | null;
}) {
  const [current, setCurrent] = useState(link);
  return (
    <ShareLink
      link={current}
      haikuId={HAIKU_ID}
      haikuSubject={SUBJECT}
      onChanged={() => undefined}
      onLinkUpdate={setCurrent}
    />
  );
}

/** Story-only: auto-clicks Start with an injected delayed create so Activating is visible. */
function ActivatingShareLinkStory() {
  const [link, setLink] = useState<ShareLinkListItem | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>('button[aria-label="Start link"]');
      btn?.click();
    }, 400);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <ShareLink
      link={link}
      haikuId={HAIKU_ID}
      haikuSubject={SUBJECT}
      onChanged={() => undefined}
      onLinkUpdate={setLink}
      createShareLinkFn={delayedCreateShareLink}
    />
  );
}

const meta = {
  title: "Haiku/ShareLink",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "42rem", height: "22rem", padding: "1rem", background: "#818181" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const NoLink: Story = {
  render: () => <ShareLinkStory link={null} />,
};

export const Activating: Story = {
  render: () => <ActivatingShareLinkStory />,
};

export const Active: Story = {
  render: () => <ShareLinkStory link={baseLink} />,
};

export const Stopped: Story = {
  render: () => (
    <ShareLinkStory
      link={{ ...baseLink, id: "22222222-2222-4222-8222-222222222222", disabled: true }}
    />
  ),
};

export const Expired: Story = {
  render: () => (
    <ShareLinkStory
      link={{
        ...baseLink,
        id: "33333333-3333-4333-8333-333333333333",
        expirationDate: "2020-01-01T00:00:00.000Z",
        disabled: false,
      }}
    />
  ),
};

export const ViewLimitReached: Story = {
  render: () => (
    <ShareLinkStory
      link={{
        ...baseLink,
        id: "44444444-4444-4444-8444-444444444444",
        maxViews: 5,
        viewCount: 5,
        disabled: false,
      }}
    />
  ),
};

export const RemainingViews: Story = {
  render: () => (
    <ShareLinkStory
      link={{
        ...baseLink,
        id: "55555555-5555-4555-8555-555555555555",
        maxViews: 10,
        viewCount: 3,
      }}
    />
  ),
};

export const ExpiringSoon: Story = {
  render: () => (
    <ShareLinkStory
      link={{
        ...baseLink,
        id: "66666666-6666-4666-8666-666666666666",
        expirationDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      }}
    />
  ),
};

export const Permanent: Story = {
  render: () => <ShareLinkStory link={baseLink} />,
};

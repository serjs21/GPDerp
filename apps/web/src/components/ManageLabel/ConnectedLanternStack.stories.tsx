import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { ConnectedHaikusPanel } from "./ConnectedHaikusPanel";
import { ConnectedLanternStack } from "./ConnectedLanternStack";
import manageStyles from "./ManageLabel.module.css";

const ACCOUNT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const DEMO_ITEMS: LabelConnectedHaikuPreview[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Morning mist",
    body: "Morning mist softens\nthe mountain path underfoot\nbirdsong finds the pines",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Tea steam",
    body: "Cup warms both hands\nsteam draws a quiet spiral\nwindow holds the rain",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Lantern dusk",
    body: "Paper glow leans left\nwind combs the garden bamboo\nnight folds into ink",
  },
];

/**
 * Same strip flex context as ManageLabel on /settings?tab=labels:
 * label | connected haikus | delete — so the connected panel gets production width.
 */
function SettingsLabelsStripStage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "min(42rem, 96vw)",
        padding: "1.5rem",
        background: "#d8d2c8",
      }}
    >
      <ComicPageRow className={manageStyles.strip}>
        <ComicPagePanel
          background="solid"
          color="white"
          overflowVisible
          flexWeight={1}
          className={manageStyles.labelPanel}
          ariaLabel="Label preview"
        >
          <div className={manageStyles.labelPreview} />
        </ComicPagePanel>
        <div className={[manageStyles.overlaySlot, manageStyles.overlaySlotFan].join(" ")}>
          {children}
        </div>
        <ComicPagePanel
          background="solid"
          color="white"
          flexWeight={1}
          className={manageStyles.actionSlot}
          ariaLabel="Delete action"
        />
      </ComicPageRow>
    </div>
  );
}

const meta = {
  title: "Haiku/ConnectedLanternStack",
  component: ConnectedLanternStack,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <SettingsLabelsStripStage>
        <Story />
      </SettingsLabelsStripStage>
    ),
  ],
} satisfies Meta<typeof ConnectedLanternStack>;

export default meta;
type Story = StoryObj<typeof ConnectedLanternStack>;

function renderInConnectedPanel(
  args: { accountId: string; items: LabelConnectedHaikuPreview[] },
  total = args.items.length,
) {
  return (
    <ConnectedHaikusPanel
      accountId={args.accountId}
      labelName="Zen"
      items={args.items}
      total={total}
      isPending={false}
    />
  );
}

export const Single: Story = {
  render: (args) => renderInConnectedPanel(args),
  args: {
    accountId: ACCOUNT_ID,
    items: DEMO_ITEMS.slice(0, 1),
  },
};

export const Pair: Story = {
  render: (args) => renderInConnectedPanel(args),
  args: {
    accountId: ACCOUNT_ID,
    items: DEMO_ITEMS.slice(0, 2),
  },
};

export const Triple: Story = {
  render: (args) => renderInConnectedPanel(args),
  args: {
    accountId: ACCOUNT_ID,
    items: DEMO_ITEMS,
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
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
 * Wide/tall enough for the triple fan (center + left rotated + right mini)
 * to stay inside the connected comic panel border with padding.
 */
function ConnectedPanelStage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "42rem",
        padding: "2rem",
        background: "#d8d2c8",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: "22rem",
        }}
        className={manageStyles.strip}
      >
        {children}
      </div>
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
      <ConnectedPanelStage>
        <Story />
      </ConnectedPanelStage>
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

/** Three preview lanterns + overflow caption for a 10-haiku label. */
export const TenWithMore: Story = {
  name: "10 lanterns (+7 more)",
  render: (args) => renderInConnectedPanel(args, 10),
  args: {
    accountId: ACCOUNT_ID,
    items: DEMO_ITEMS,
  },
};

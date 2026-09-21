import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { ConnectedHaikusPanel } from "./ConnectedHaikusPanel";
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
  title: "Haiku/ConnectedHaikusPanel",
  component: ConnectedHaikusPanel,
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
} satisfies Meta<typeof ConnectedHaikusPanel>;

export default meta;
type Story = StoryObj<typeof ConnectedHaikusPanel>;

export const Triple: Story = {
  args: {
    accountId: ACCOUNT_ID,
    labelName: "Zen",
    items: DEMO_ITEMS,
    total: 3,
  },
};

/** Preview stays at 3 lanterns; `total` drives the overflow caption. */
export const MoreThanThree: Story = {
  name: "+4 more (7 total)",
  args: {
    accountId: ACCOUNT_ID,
    labelName: "Zen",
    items: DEMO_ITEMS,
    total: 7,
  },
};

export const Empty: Story = {
  args: {
    accountId: ACCOUNT_ID,
    labelName: "Zen",
    items: [],
    total: 0,
  },
};

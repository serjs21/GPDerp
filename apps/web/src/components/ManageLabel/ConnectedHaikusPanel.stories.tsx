import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { ConnectedHaikusPanel } from "./ConnectedHaikusPanel";

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

const meta = {
  title: "Haiku/ConnectedHaikusPanel",
  component: ConnectedHaikusPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "14rem",
          height: "12rem",
          boxSizing: "border-box",
        }}
      >
        <Story />
      </div>
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
    isPending: false,
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
    isPending: false,
  },
};

export const Empty: Story = {
  args: {
    accountId: ACCOUNT_ID,
    labelName: "Zen",
    items: [],
    total: 0,
    isPending: false,
  },
};

export const Loading: Story = {
  args: {
    accountId: ACCOUNT_ID,
    labelName: "Zen",
    items: [],
    total: 0,
    isPending: true,
  },
};

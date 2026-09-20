import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { ConnectedLanternStack } from "./ConnectedLanternStack";

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
  title: "Haiku/ConnectedLanternStack",
  component: ConnectedLanternStack,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "14rem",
          height: "10rem",
          padding: "1rem",
          background: "#818181",
          boxSizing: "border-box",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConnectedLanternStack>;

export default meta;
type Story = StoryObj<typeof ConnectedLanternStack>;

export const Single: Story = {
  args: {
    accountId: ACCOUNT_ID,
    items: DEMO_ITEMS.slice(0, 1),
  },
};

export const Pair: Story = {
  args: {
    accountId: ACCOUNT_ID,
    items: DEMO_ITEMS.slice(0, 2),
  },
};

export const Triple: Story = {
  args: {
    accountId: ACCOUNT_ID,
    items: DEMO_ITEMS,
  },
};

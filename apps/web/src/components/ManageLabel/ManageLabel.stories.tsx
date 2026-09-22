"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import type { LabelConnectedHaikuPreview, LabelDto } from "@/api/labels";
import { HaikuFiltersProvider } from "@/app/providers/HaikuFiltersProvider";
import { ComicToastProvider } from "@/components/ComicToast";
import { createStoryQueryClient } from "@/storybook/queryClient";
import { ManageLabel } from "./ManageLabel";

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
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "River stones",
    body: "Smooth stones keep watch\nwhere the river bends quietly\nwillow counts the hours",
  },
];

function makeLabel(
  overrides: Partial<LabelDto> & {
    connectedHaikus?: LabelDto["connectedHaikus"];
  } = {},
): LabelDto {
  return {
    id: "label-zen-0001-4000-8000-000000000001",
    name: "Zen",
    color: "#6b8f71",
    shape: "burst",
    accountId: ACCOUNT_ID,
    createdAt: "2026-09-01T12:00:00.000Z",
    ...overrides,
  };
}

const meta = {
  title: "Haiku/ManageLabel",
  component: ManageLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/manage_labels",
      },
    },
  },
  decorators: [
    (Story) => {
      const queryClient = createStoryQueryClient();
      return (
        <QueryClientProvider client={queryClient}>
          <ComicToastProvider>
            <HaikuFiltersProvider>
              <div
                style={{
                  boxSizing: "border-box",
                  width: "min(42rem, 96vw)",
                  padding: "1.5rem",
                  background: "#d8d2c8",
                }}
              >
                <Story />
              </div>
            </HaikuFiltersProvider>
          </ComicToastProvider>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof ManageLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full manage-labels strip row with four haiku connections (3 fan + “+1 more”). */
export const FourConnections: Story = {
  name: "4 connections",
  args: {
    accountId: ACCOUNT_ID,
    label: makeLabel({
      connectedHaikus: {
        total: 4,
        items: DEMO_ITEMS.slice(0, 3),
      },
    }),
  },
};

export const Empty: Story = {
  args: {
    accountId: ACCOUNT_ID,
    label: makeLabel({
      connectedHaikus: { total: 0, items: [] },
    }),
  },
};

export const Triple: Story = {
  args: {
    accountId: ACCOUNT_ID,
    label: makeLabel({
      connectedHaikus: {
        total: 3,
        items: DEMO_ITEMS.slice(0, 3),
      },
    }),
  },
};

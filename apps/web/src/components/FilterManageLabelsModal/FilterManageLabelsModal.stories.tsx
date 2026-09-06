import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { labelQueryKeys } from "@/api/labels";
import { STORY_ACCOUNT_ID, withQueryClientSeed } from "@/storybook";
import { FilterManageLabelsModal } from "./FilterManageLabelsModal";

const labelCatalog = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    name: "Nature",
    color: "#52c41a",
    shape: "classic",
    accountId: STORY_ACCOUNT_ID,
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    name: "Morning",
    color: "#1677ff",
    shape: "circle",
    accountId: STORY_ACCOUNT_ID,
    createdAt: new Date("2026-01-02T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    name: "Philosophy",
    color: "#722ed1",
    shape: "thought",
    accountId: STORY_ACCOUNT_ID,
    createdAt: new Date("2026-01-03T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    name: "Pond",
    color: "#13c2c2",
    shape: "soft",
    accountId: STORY_ACCOUNT_ID,
    createdAt: new Date("2026-01-04T00:00:00.000Z").toISOString(),
  },
];

function seedLabelQueries(
  qc: Parameters<Parameters<typeof withQueryClientSeed>[0]>[0],
  labels: typeof labelCatalog,
) {
  qc.setQueryData(labelQueryKeys.byAccount(STORY_ACCOUNT_ID), labels);
  qc.setQueryData(labelQueryKeys.pagedByAccount(STORY_ACCOUNT_ID, 12, ""), {
    pages: [
      {
        labels,
        total: labels.length,
        pageSize: 12,
        offset: 0,
      },
    ],
    pageParams: [0],
  });
}

const meta = {
  title: "Haiku/FilterManageLabelsModal",
  component: FilterManageLabelsModal,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    withQueryClientSeed((qc) => {
      seedLabelQueries(qc, labelCatalog);
    }),
  ],
  args: {
    open: true,
    accountId: STORY_ACCOUNT_ID,
    initialTab: "filter" as const,
    selectedIds: ["00000000-0000-4000-8000-000000000201"],
    onApply: () => undefined,
    onClose: () => undefined,
  },
} satisfies Meta<typeof FilterManageLabelsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilterDefault: Story = {};

export const ManageList: Story = {
  args: {
    initialTab: "manage",
  },
};

export const ManageEmpty: Story = {
  decorators: [
    withQueryClientSeed((qc) => {
      seedLabelQueries(qc, []);
    }),
  ],
  args: {
    initialTab: "manage",
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};

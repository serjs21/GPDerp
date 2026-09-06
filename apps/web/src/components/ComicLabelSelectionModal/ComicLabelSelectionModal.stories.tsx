import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import { labelQueryKeys } from "@/api/labels";
import { STORY_ACCOUNT_ID, withQueryClientSeed } from "@/storybook";
import {
  ComicLabelSelectionModal,
  type ComicLabelSelectionFilterProps,
} from "./ComicLabelSelectionModal";

const haiku: HaikuDto = {
  id: "00000000-0000-4000-8000-000000000010",
  title: "Morning Light",
  titleSuffix: 0,
  body: "Sparrows on the wire,\nthin gold spills through cedar leaves,\ndawn writes in silence.",
  createdAt: new Date("2026-03-01T08:30:00.000Z").toISOString(),
  accountId: STORY_ACCOUNT_ID,
  createdById: "00000000-0000-4000-8000-000000000099",
  labels: [
    { id: "00000000-0000-4000-8000-000000000201", name: "Nature", color: "#52c41a", shape: "classic" },
    { id: "00000000-0000-4000-8000-000000000202", name: "Morning", color: "#1677ff", shape: "circle" },
  ],
};

const labelCatalog = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    name: "Nature",
    color: "#52c41a",
    shape: "classic",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    name: "Morning",
    color: "#1677ff",
    shape: "circle",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-02T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    name: "Philosophy",
    color: "#722ed1",
    shape: "thought",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-03T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    name: "Pond",
    color: "#13c2c2",
    shape: "soft",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-04T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000205",
    name: "Crow",
    color: "#fa541c",
    shape: "sharp",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-05T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000206",
    name: "Snow",
    color: "#ffffff",
    shape: "square",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-06T00:00:00.000Z").toISOString(),
  },
];

function seedLabelQueries(
  qc: Parameters<Parameters<typeof withQueryClientSeed>[0]>[0],
  labels: typeof labelCatalog,
) {
  qc.setQueryData(labelQueryKeys.byAccount(haiku.accountId), labels);
  qc.setQueryData(labelQueryKeys.pagedByAccount(haiku.accountId, 12, ""), {
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

const meta: Meta<typeof ComicLabelSelectionModal> = {
  title: "Haiku/ComicLabelSelectionModal (archive)",
  component: ComicLabelSelectionModal,
  decorators: [
    withQueryClientSeed((qc) => {
      seedLabelQueries(qc, labelCatalog);
    }),
  ],
  args: {
    open: true,
    haiku,
    onClose: () => undefined,
    onSaved: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ComicLabelSelectionModal>;

export const Default: Story = {};

export const NoSelection: Story = {
  args: {
    haiku: { ...haiku, labels: [] },
  },
};

export const EmptyCatalog: Story = {
  decorators: [
    withQueryClientSeed((qc) => {
      seedLabelQueries(qc, []);
    }),
  ],
  args: {
    haiku: { ...haiku, labels: [] },
  },
};

export const FilterMode: StoryObj<ComicLabelSelectionFilterProps> = {
  args: {
    mode: "filter",
    open: true,
    accountId: STORY_ACCOUNT_ID,
    selectedIds: ["00000000-0000-4000-8000-000000000201"],
    onApply: () => undefined,
    onClose: () => undefined,
  },
};

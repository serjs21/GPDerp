import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import { STORY_ACCOUNT_ID, withQueryClientSeed } from "@/storybook";
import { ManageLabelsModal } from "./ManageLabelsModal";

const haiku: HaikuDto = {
  id: "00000000-0000-4000-8000-000000000010",
  title: "Morning Light",
  titleSuffix: 0,
  body: "Sparrows on the wire,\nthin gold spills through cedar leaves,\ndawn writes in silence.",
  createdAt: new Date("2026-03-01T08:30:00.000Z").toISOString(),
  accountId: STORY_ACCOUNT_ID,
  createdById: "00000000-0000-4000-8000-000000000099",
  labels: [
    { id: "00000000-0000-4000-8000-000000000201", name: "Nature", color: "green", shape: "classic" },
    { id: "00000000-0000-4000-8000-000000000202", name: "Morning", color: "blue", shape: "circle" },
  ],
};

const labelCatalog = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    name: "Nature",
    color: "green",
    shape: "classic",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    name: "Morning",
    color: "blue",
    shape: "circle",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    name: "Philosophy",
    color: "purple",
    shape: "thought",
    accountId: haiku.accountId,
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
];

const meta: Meta<typeof ManageLabelsModal> = {
  title: "Haiku/ManageLabelsModal",
  component: ManageLabelsModal,
  decorators: [
    withQueryClientSeed((qc) => {
      qc.setQueryData(["labels", "account", haiku.accountId], labelCatalog);
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
type Story = StoryObj<typeof ManageLabelsModal>;

export const Default: Story = {};

export const NoLabelsYet: Story = {
  decorators: [
    withQueryClientSeed((qc) => {
      qc.setQueryData(["labels", "account", haiku.accountId], []);
    }),
  ],
};

export const Loading: Story = {
  args: {
    loadingOverride: true,
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ManageLabelsModal } from "./ManageLabelsModal";

const haiku: HaikuDto = {
  id: "00000000-0000-4000-8000-000000000010",
  title: "Morning Light",
  titleSuffix: 0,
  body: "Sparrows on the wire,\nthin gold spills through cedar leaves,\ndawn writes in silence.",
  createdAt: new Date("2026-03-01T08:30:00.000Z").toISOString(),
  accountId: "00000000-0000-4000-8000-000000000001",
  createdById: "00000000-0000-4000-8000-000000000099",
  labels: [
    { id: "00000000-0000-4000-8000-000000000201", name: "Nature", color: "green" },
    { id: "00000000-0000-4000-8000-000000000202", name: "Morning", color: "blue" },
  ],
};

const meta: Meta<typeof ManageLabelsModal> = {
  title: "Haiku/ManageLabelsModal",
  component: ManageLabelsModal,
  decorators: [
    (Story) => {
      const qc = new QueryClient();
      qc.setQueryData(["labels", "account", haiku.accountId], [
        {
          id: "00000000-0000-4000-8000-000000000201",
          name: "Nature",
          color: "green",
          accountId: haiku.accountId,
          createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
        },
        {
          id: "00000000-0000-4000-8000-000000000202",
          name: "Morning",
          color: "blue",
          accountId: haiku.accountId,
          createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
        },
        {
          id: "00000000-0000-4000-8000-000000000203",
          name: "Philosophy",
          color: "purple",
          accountId: haiku.accountId,
          createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
        },
      ]);
      return (
        <QueryClientProvider client={qc}>
          <Story />
        </QueryClientProvider>
      );
    },
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
    (Story) => {
      const qc = new QueryClient();
      qc.setQueryData(["labels", "account", haiku.accountId], []);
      return (
        <QueryClientProvider client={qc}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export const Loading: Story = {
  args: {
    loadingOverride: true,
  },
};

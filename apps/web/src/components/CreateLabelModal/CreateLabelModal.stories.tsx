import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateLabelModal } from "./CreateLabelModal";

const meta: Meta<typeof CreateLabelModal> = {
  title: "Haiku/CreateLabelModal",
  component: CreateLabelModal,
  decorators: [
    (Story) => {
      const qc = new QueryClient();
      qc.setQueryData(["labels", "account", "00000000-0000-4000-8000-000000000001"], [
        {
          id: "00000000-0000-4000-8000-000000000101",
          name: "Nature",
          color: "green",
          accountId: "00000000-0000-4000-8000-000000000001",
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
    accountId: "00000000-0000-4000-8000-000000000001",
    onClose: () => undefined,
    onCreated: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CreateLabelModal>;

export const Default: Story = {};

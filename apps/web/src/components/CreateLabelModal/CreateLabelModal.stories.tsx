import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { STORY_ACCOUNT_ID, withQueryClientSeed } from "@/storybook";
import { CreateLabelModal } from "./CreateLabelModal";

const meta: Meta<typeof CreateLabelModal> = {
  title: "Haiku/CreateLabelModal",
  component: CreateLabelModal,
  decorators: [
    withQueryClientSeed((qc) => {
      qc.setQueryData(["labels", "account", STORY_ACCOUNT_ID], [
        {
          id: "00000000-0000-4000-8000-000000000101",
          name: "Nature",
          color: "green",
          accountId: STORY_ACCOUNT_ID,
          createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
        },
      ]);
    }),
  ],
  args: {
    open: true,
    accountId: STORY_ACCOUNT_ID,
    onClose: () => undefined,
    onCreated: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CreateLabelModal>;

export const Default: Story = {};

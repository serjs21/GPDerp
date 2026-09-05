import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { STORY_ACCOUNT_ID, withQueryClientSeed } from "@/storybook";
import { ComicLabelCreationModal } from "./ComicLabelCreationModal";

const meta: Meta<typeof ComicLabelCreationModal> = {
  title: "Haiku/ComicLabelCreationModal",
  component: ComicLabelCreationModal,
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
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ComicLabelCreationModal>;

function OpenCreateHost() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "#1a2744" }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open create label
      </button>
      <ComicLabelCreationModal
        open={open}
        accountId={STORY_ACCOUNT_ID}
        onClose={() => setOpen(false)}
        onCreated={() => setOpen(false)}
      />
    </div>
  );
}

export const Create: Story = {
  render: () => <OpenCreateHost />,
};

export const Edit: Story = {
  args: {
    open: true,
    accountId: STORY_ACCOUNT_ID,
    label: {
      id: "00000000-0000-4000-8000-000000000101",
      name: "Mist",
      color: "#1677ff",
      accountId: STORY_ACCOUNT_ID,
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    },
    onClose: () => undefined,
    onUpdated: () => undefined,
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ALL_SHARE_LINK_FILTERS, type ShareLinkFilter } from "@/api/shareLinks";
import { ComicPageRow } from "@/components/ComicPageLayout";
import { ShareLinkFilterPanels } from "@/components/ShareLinkManagement/ShareLinkFilterPanels";

function ShareLinkFilterPanelsStoryShell() {
  return null;
}

const meta = {
  title: "Components/LabelFilter",
  component: ShareLinkFilterPanelsStoryShell,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ShareLinkFilterPanelsStoryShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<ShareLinkFilter[]>([...ALL_SHARE_LINK_FILTERS]);
    return (
      <div style={{ width: "min(36rem, 92vw)" }}>
        <ComicPageRow>
          <ShareLinkFilterPanels selected={selected} onChange={setSelected} />
        </ComicPageRow>
      </div>
    );
  },
};

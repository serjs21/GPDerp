import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { ComicPanelTabs } from "./ComicPanelTabs";

type DemoTab = "profile" | "tokens" | "share-links" | "labels";

const DEMO_TABS: Array<{
  id: DemoTab;
  title: string;
  background: "sunburst" | "halftone" | "solid";
  color: "blue" | "orange" | "teal" | "green";
  iconSrc: string;
  bubbleStyle: "circle" | "diamond" | "rectangle" | "thought";
  ariaLabel: string;
}> = [
  {
    id: "profile",
    title: "Profile",
    background: "sunburst",
    color: "blue",
    iconSrc: "/profile/profile.svg",
    bubbleStyle: "circle",
    ariaLabel: "Profile information",
  },
  {
    id: "tokens",
    title: "Tokens",
    background: "halftone",
    color: "orange",
    iconSrc: "/profile/tokens.svg",
    bubbleStyle: "diamond",
    ariaLabel: "Generation tokens",
  },
  {
    id: "share-links",
    title: "Share Links",
    background: "solid",
    color: "teal",
    iconSrc: "/profile/share_link.svg",
    bubbleStyle: "rectangle",
    ariaLabel: "Manage share links",
  },
  {
    id: "labels",
    title: "Labels",
    background: "halftone",
    color: "green",
    iconSrc: "/profile/labels.svg",
    bubbleStyle: "thought",
    ariaLabel: "Manage labels",
  },
];

function ComicPanelTabsDemo({ initialTab = "share-links" }: { initialTab?: DemoTab }) {
  const [tab, setTab] = useState<DemoTab>(initialTab);
  return (
    <div style={{ padding: "1.5rem", background: "#f4f1ea", maxWidth: "56rem" }}>
      <ComicPanelTabs
        value={tab}
        onChange={setTab}
        aria-label="Settings sections"
        tabs={DEMO_TABS.map((meta) => ({
          id: meta.id,
          panel: {
            title: meta.title,
            background: meta.background,
            color: meta.color,
            ariaLabel: meta.ariaLabel,
          },
          content: (
            <LabelMethodIcon
              src={meta.iconSrc}
              bubbleStyle={meta.bubbleStyle}
              sourceDirection="none"
              active={tab === meta.id}
            />
          ),
        }))}
      />
      <p style={{ marginTop: "1rem", fontFamily: "var(--font-lantern-script, cursive)" }}>
        Selected: {tab}
      </p>
    </div>
  );
}

const meta = {
  title: "Haiku/ComicPanelTabs",
  component: ComicPanelTabsDemo,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ComicPanelTabsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SettingsStyle: Story = {
  args: {
    initialTab: "share-links",
  },
};

export const ProfileSelected: Story = {
  args: {
    initialTab: "profile",
  },
};

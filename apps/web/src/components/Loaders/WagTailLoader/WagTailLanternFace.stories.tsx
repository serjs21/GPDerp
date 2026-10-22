import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";
import { LanternBaseLoaderShell } from "@/components/Loaders/LanternBaseLoaderShell";
import { WagTailLanternFace } from "./WagTailLanternFace";

const STAGE_STYLE = { padding: "3rem", background: "#2b3150" } as const;
const ROW_STYLE = { display: "flex", gap: "3rem", alignItems: "flex-end", flexWrap: "wrap" } as const;

const sized = (width: string) => ({ "--lantern-loader-width": width }) as CSSProperties;

/** WagTailLanternFace on LanternBaseLoaderShell (the share link preview's loader). */
const meta = {
  title: "Loaders/WagTailLanternFace",
  component: WagTailLanternFace,
  parameters: { layout: "centered" },
  args: { caption: "Waiting for data to arrive" },
  decorators: [
    (Story) => (
      <div style={STAGE_STYLE}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <LanternBaseLoaderShell>
      <WagTailLanternFace {...args} />
    </LanternBaseLoaderShell>
  ),
} satisfies Meta<typeof WagTailLanternFace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Scales with --lantern-loader-width: default, share link preview (17.5rem), phone preview width. */
export const Sizes: Story = {
  render: (args) => (
    <div style={ROW_STYLE}>
      {["11.5rem", "16rem", "17.5rem"].map((width) => (
        <div key={width} style={sized(width)}>
          <LanternBaseLoaderShell>
            <WagTailLanternFace {...args} />
          </LanternBaseLoaderShell>
        </div>
      ))}
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";
import { FetchingLanternLoader } from "./FetchingLanternLoader";

const STAGE_STYLE = { padding: "3rem", background: "#2b3150" } as const;
const ROW_STYLE = { display: "flex", gap: "3rem", alignItems: "flex-end", flexWrap: "wrap" } as const;

const sized = (width: string) => ({ "--lantern-loader-width": width }) as CSSProperties;

const meta = {
  title: "Loaders/FetchingLanternLoader",
  component: FetchingLanternLoader,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={STAGE_STYLE}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FetchingLanternLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default size (Lantern's default width). */
export const Default: Story = {};

/** Everything scales with --lantern-loader-width: small, default, share link preview, path focus lantern. */
export const Sizes: Story = {
  render: () => (
    <div style={ROW_STYLE}>
      {["7rem", "11.5rem", "17.5rem", "19rem"].map((width) => (
        <div key={width} style={sized(width)}>
          <FetchingLanternLoader />
        </div>
      ))}
    </div>
  ),
};

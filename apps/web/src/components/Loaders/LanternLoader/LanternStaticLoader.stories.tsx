import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LanternLoader } from "./LanternLoader";
import { LanternStaticLoader } from "./LanternStaticLoader";

const STAGE_STYLE = { padding: "3rem 3rem 6rem", background: "#f7f4ef" } as const;
const ROW_STYLE = { display: "flex", gap: "5rem", alignItems: "flex-start", flexWrap: "wrap" } as const;
const CAPTION_STYLE = { margin: "0 0 1rem", font: "600 0.8rem/1.2 sans-serif", color: "#555" } as const;

const meta = {
  title: "Loaders/LanternStaticLoader",
  component: LanternStaticLoader,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={STAGE_STYLE}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LanternStaticLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Defaults fixed in CSS: no inline styles, no generated keyframes, server-safe. */
export const Default: Story = {};

/** Static version next to the configurable loader on its defaults: they should step identically. */
export const ParityWithConfigurable: Story = {
  render: () => (
    <div style={ROW_STYLE}>
      <figure>
        <figcaption style={CAPTION_STYLE}>LanternStaticLoader</figcaption>
        <LanternStaticLoader />
      </figure>
      <figure>
        <figcaption style={CAPTION_STYLE}>LanternLoader (defaults)</figcaption>
        <LanternLoader />
      </figure>
    </div>
  ),
};

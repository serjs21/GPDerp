import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FetchingLoader } from "./FetchingLoader";
import { FetchingStaticLoader } from "./FetchingStaticLoader";

const STAGE_STYLE = { padding: "3rem", background: "#fff" } as const;
const ROW_STYLE = { display: "flex", gap: "5rem", alignItems: "flex-start" } as const;
const CAPTION_STYLE = { margin: "0 0 1rem", font: "600 0.8rem/1.2 sans-serif", color: "#555" } as const;

const meta = {
  title: "Loaders/FetchingStaticLoader",
  component: FetchingStaticLoader,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={STAGE_STYLE}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FetchingStaticLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Defaults fixed in CSS (no inline styles) with the localized "Fetching..." caption; used by the settings lists. */
export const Default: Story = {};

/** Static version next to the configurable loader on its defaults: the dog should run identically. */
export const ParityWithConfigurable: Story = {
  render: () => (
    <div style={ROW_STYLE}>
      <figure>
        <figcaption style={CAPTION_STYLE}>FetchingStaticLoader</figcaption>
        <FetchingStaticLoader />
      </figure>
      <figure>
        <figcaption style={CAPTION_STYLE}>FetchingLoader (defaults)</figcaption>
        <FetchingLoader />
      </figure>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WagTailLoader } from "./WagTailLoader";
import { WagTailStaticLoader } from "./WagTailStaticLoader";
import { WagTailStaticLoaderWithBackground } from "./WagTailStaticLoaderWithBackground";

const STAGE_STYLE = { padding: "3rem", background: "#f7f4ef" } as const;
const ROW_STYLE = { display: "flex", gap: "4rem", alignItems: "center", flexWrap: "wrap" } as const;
const CAPTION_STYLE = { margin: "0 0 4rem", font: "600 0.8rem/1.2 sans-serif", color: "#555" } as const;

const meta = {
  title: "Loaders/WagTailStaticLoader",
  component: WagTailStaticLoader,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={STAGE_STYLE}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WagTailStaticLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Defaults fixed in CSS, no background. Server-safe: no props to tune, no client JS. */
export const WithoutBackground: Story = {};

/** Same, plus the stepped background behind the dog. */
export const WithBackground: Story = {
  render: () => <WagTailStaticLoaderWithBackground />,
};

/** Static versions next to the configurable loader on its defaults: they should look and move the same. */
export const ParityWithConfigurable: Story = {
  render: () => (
    <div style={ROW_STYLE}>
      <figure>
        <figcaption style={CAPTION_STYLE}>WagTailStaticLoader</figcaption>
        <WagTailStaticLoader />
      </figure>
      <figure>
        <figcaption style={CAPTION_STYLE}>WagTailStaticLoaderWithBackground</figcaption>
        <WagTailStaticLoaderWithBackground />
      </figure>
      <figure>
        <figcaption style={CAPTION_STYLE}>WagTailLoader (defaults)</figcaption>
        <WagTailLoader />
      </figure>
    </div>
  ),
};

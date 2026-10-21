import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FETCHING_LOADER_DEFAULTS } from "./consts/fetchingLoaderConsts";
import { FetchingLoader } from "./FetchingLoader";

const meta = {
  title: "Loaders/FetchingLoader",
  component: FetchingLoader,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ padding: "3rem", background: "#f7f4ef" }}>
        <Story />
      </div>
    ),
  ],
  args: { ...FETCHING_LOADER_DEFAULTS },
  argTypes: {
    widthRem: { control: { type: "range", min: 3, max: 30, step: 0.5 } },
    frameMs: { control: { type: "range", min: 40, max: 1000, step: 10 } },
    className: { control: false },
  },
} satisfies Meta<typeof FetchingLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Frames 1 2 1 3 on repeat. */
export const Default: Story = {};

/** 500ms per frame: easy to check the order and that the feet stay on one baseline. */
export const SlowMotion: Story = {
  args: { frameMs: 500 },
};

/** Small inline size, e.g. next to a "fetching" caption. */
export const Small: Story = {
  args: { widthRem: 4 },
};

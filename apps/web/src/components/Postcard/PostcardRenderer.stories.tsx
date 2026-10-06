import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { makeMockHaiku } from "@/storybook/fixtures/haiku";
import { CELESTIAL_SLOTS_PER_DAY } from "@/theme/celestialTime";
import { PostcardStoryStage } from "./PostcardStoryStage";

type PostcardStoryArgs = {
  slot: number;
  showTitle: boolean;
  showAuthor: boolean;
  longLines: boolean;
  fontScale: number;
  scale: number;
};

const SHORT_LINES = ["An old silent pond", "A frog jumps into the pond", "Splash! Silence again"];
const LONG_LINES = [
  "Lanterns drift upward over the sleeping river town",
  "carrying small wishes folded into paper and candle smoke",
  "until the night sky keeps them like distant patient stars",
];

function buildStoryHaiku(args: PostcardStoryArgs) {
  const lines = args.longLines ? LONG_LINES : SHORT_LINES;
  const body = [...lines, ...(args.showAuthor ? ["— Matsuo Bashō"] : [])].join("\n");
  return makeMockHaiku({
    id: "postcard-story",
    title: args.showTitle ? "Old pond" : "",
    body,
  });
}

const meta: Meta<PostcardStoryArgs> = {
  title: "Postcard/PostcardRenderer",
  parameters: { layout: "fullscreen" },
  argTypes: {
    slot: { control: { type: "range", min: 0, max: CELESTIAL_SLOTS_PER_DAY - 1, step: 1 } },
    fontScale: { control: { type: "range", min: 0.6, max: 1.4, step: 0.05 } },
    scale: { control: { type: "range", min: 0.25, max: 1, step: 0.05 } },
  },
  args: {
    slot: 88,
    showTitle: true,
    showAuthor: true,
    longLines: false,
    fontScale: 1,
    scale: 0.5,
  },
  render: (args) => (
    <PostcardStoryStage
      slot={args.slot}
      haiku={buildStoryHaiku(args)}
      fontScale={args.fontScale}
      scale={args.scale}
    />
  ),
};

export default meta;
type Story = StoryObj<PostcardStoryArgs>;

export const Night: Story = {};

export const Dusk: Story = { args: { slot: 74 } };

export const Day: Story = { args: { slot: 48 } };

export const LongLines: Story = { args: { longLines: true } };

export const BodyOnly: Story = { args: { showTitle: false, showAuthor: false } };

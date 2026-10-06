import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CELESTIAL_SLOTS_PER_DAY } from "@/theme/celestialTime";
import { POSTCARD_MESSAGE_MAX_CHARS } from "./consts/postcardMessageConsts";
import { PostcardMessageStoryStage } from "./PostcardMessageStoryStage";

type PostcardMessageStoryArgs = {
  slot: number;
  message: string;
  senderName: string;
  recipientCount: number;
  scale: number;
};

const SHORT_MESSAGE =
  "I saw this lantern & had to send it to you!\nRemember our trip to Kyoto?\nWish you were here.";

/** Ordinary prose at exactly the character cap. */
const AT_LIMIT_MESSAGE =
  "I saw this card and had to buy it for you! Remember our trip to Kyoto? I am having fun but miss you lots. Wish you were here, I miss your jokes and our late night ramen walks by the river. See you soon!"
    .slice(0, POSTCARD_MESSAGE_MAX_CHARS);

const recipientsFor = (count: number) =>
  Array.from({ length: count }, (_, index) => `friend${index + 1}@example.com`);

const meta: Meta<PostcardMessageStoryArgs> = {
  title: "Postcard/PostcardMessage",
  parameters: { layout: "fullscreen" },
  argTypes: {
    slot: { control: { type: "range", min: 0, max: CELESTIAL_SLOTS_PER_DAY - 1, step: 1 } },
    message: { control: { type: "text" } },
    recipientCount: { control: { type: "range", min: 1, max: 6, step: 1 } },
    scale: { control: { type: "range", min: 0.25, max: 1, step: 0.05 } },
  },
  args: {
    slot: 88,
    message: SHORT_MESSAGE,
    senderName: "Aki",
    recipientCount: 1,
    scale: 0.5,
  },
  render: (args) => (
    <PostcardMessageStoryStage
      slot={args.slot}
      message={args.message}
      senderName={args.senderName}
      recipients={recipientsFor(args.recipientCount)}
      scale={args.scale}
    />
  ),
};

export default meta;
type Story = StoryObj<PostcardMessageStoryArgs>;

export const Default: Story = {};

export const Day: Story = { args: { slot: 48 } };

export const AtCharacterLimit: Story = { args: { message: AT_LIMIT_MESSAGE } };

export const ManyRecipients: Story = { args: { recipientCount: 5 } };

export const Empty: Story = { args: { message: "" } };

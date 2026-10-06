import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { POSTCARD_MESSAGE_MAX_CHARS } from "./consts/postcardMessageConsts";
import { PostcardMessageStoryStage } from "./PostcardMessageStoryStage";
import type { PostcardMessageStoryStageProps } from "./PostcardMessageStoryStage.types";

const SHORT_MESSAGE =
  "I saw this lantern & had to send it to you!\nRemember our trip to Kyoto?\nWish you were here.";

/** Ordinary prose at exactly the character cap. */
const AT_LIMIT_MESSAGE =
  "I saw this card and had to buy it for you! Remember our trip to Kyoto? I am having fun but miss you lots. Wish you were here, I miss your jokes and our late night ramen walks by the river. See you soon!"
    .slice(0, POSTCARD_MESSAGE_MAX_CHARS);

const meta: Meta<PostcardMessageStoryStageProps> = {
  title: "Postcard/PostcardMessage",
  component: PostcardMessageStoryStage,
  parameters: { layout: "fullscreen" },
  argTypes: {
    message: { control: { type: "text" } },
    scale: { control: { type: "range", min: 0.25, max: 1, step: 0.05 } },
  },
  args: {
    message: SHORT_MESSAGE,
    senderName: "Aki",
    recipient: "tony.kim@example.com",
    scale: 0.5,
  },
};

export default meta;
type Story = StoryObj<PostcardMessageStoryStageProps>;

export const Default: Story = {};

export const AtCharacterLimit: Story = { args: { message: AT_LIMIT_MESSAGE } };

export const LongRecipient: Story = {
  args: { recipient: "a.very.long.recipient.name@some-company.example.com" },
};

export const Empty: Story = { args: { message: "" } };

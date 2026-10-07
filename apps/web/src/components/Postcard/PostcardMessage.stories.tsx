import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { POSTCARD_MESSAGE_MAX_CHARS } from "./consts/postcardMessageConsts";
import { PostcardMessage } from "./PostcardMessage";

const SHORT_MESSAGE =
  "I saw this lantern & had to send it to you!\nRemember our trip to Kyoto?\nWish you were here.";

/** Ordinary prose at exactly the character cap. */
const AT_LIMIT_MESSAGE =
  "I saw this card and had to buy it for you! Remember our trip to Kyoto? I am having fun but miss you lots. Wish you were here, I miss your jokes and our late night ramen walks by the river. See you soon!"
    .slice(0, POSTCARD_MESSAGE_MAX_CHARS);

/** Rendered at full 1200×800; emailed backs are rendered by the API to match this layout. */
const meta: Meta<typeof PostcardMessage> = {
  title: "Postcard/PostcardMessage",
  component: PostcardMessage,
  parameters: { layout: "padded" },
  argTypes: {
    message: { control: { type: "text" } },
  },
  args: {
    message: SHORT_MESSAGE,
    senderName: "Aki",
  },
};

export default meta;
type Story = StoryObj<typeof PostcardMessage>;

export const Default: Story = {};

export const AtCharacterLimit: Story = { args: { message: AT_LIMIT_MESSAGE } };

export const LongSenderName: Story = {
  args: { senderName: "Akira Tanaka-Nakamura" },
};

export const Empty: Story = { args: { message: "" } };

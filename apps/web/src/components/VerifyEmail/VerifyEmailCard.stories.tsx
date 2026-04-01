import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VerifyEmailCard } from "./VerifyEmailCard";

const meta: Meta<typeof VerifyEmailCard> = {
  title: "Auth/VerifyEmailCard",
  component: VerifyEmailCard,
};

export default meta;
type Story = StoryObj<typeof VerifyEmailCard>;

export const AlreadyValidated: Story = {
  args: {
    state: "alreadyValidated",
    countdownSeconds: 5,
  },
};

export const TokenExpired: Story = {
  args: {
    state: "tokenExpired",
    resendPending: false,
    resendDone: false,
  },
};

export const TokenExpiredResendSuccess: Story = {
  args: {
    state: "tokenExpired",
    resendDone: true,
  },
};

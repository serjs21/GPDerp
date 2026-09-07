import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResetPasswordModal } from "./ResetPasswordModal";

const meta: Meta<typeof ResetPasswordModal> = {
  title: "Auth/ResetPasswordModal",
  component: ResetPasswordModal,
  args: {
    open: true,
    onClose: () => undefined,
    mode: "request",
  },
};

export default meta;
type Story = StoryObj<typeof ResetPasswordModal>;

export const Request: Story = {};

export const Confirm: Story = {
  args: {
    mode: "confirm",
    token: "storybook-reset-token",
  },
};

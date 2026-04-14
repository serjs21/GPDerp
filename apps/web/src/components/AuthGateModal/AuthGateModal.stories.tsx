import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthGateModal } from "./AuthGateModal";

const meta: Meta<typeof AuthGateModal> = {
  title: "Auth/AuthGateModal",
  component: AuthGateModal,
  args: {
    open: true,
    onClose: () => undefined,
    onAuthenticated: () => undefined,
    initialMode: "login",
  },
};

export default meta;
type Story = StoryObj<typeof AuthGateModal>;

export const Login: Story = {};

export const Register: Story = {
  args: {
    initialMode: "register",
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};

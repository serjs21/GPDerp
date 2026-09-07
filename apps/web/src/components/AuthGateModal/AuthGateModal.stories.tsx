import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import { AuthGateModal } from "./AuthGateModal";

const meta: Meta<typeof AuthGateModal> = {
  title: "Auth/AuthGateModal",
  component: AuthGateModal,
  decorators: [
    (Story) => (
      <AuthenticationProvider>
        <AuthenticationVerificationProvider>
          <Story />
        </AuthenticationVerificationProvider>
      </AuthenticationProvider>
    ),
  ],
  args: {
    open: true,
    onClose: () => undefined,
    onAuthenticated: () => undefined,
    initialMode: "login",
    onForgotPassword: () => undefined,
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

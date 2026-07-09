import type { Decorator } from "@storybook/nextjs-vite";
import { AuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";

/** Auth context used by forest/list story surfaces. */
export const withAuthProviders: Decorator = (Story) => (
  <AuthenticationProvider>
    <AuthenticationVerificationProvider>
      <div style={{ padding: "1.5rem", maxWidth: "48rem", margin: "0 auto" }}>
        <Story />
      </div>
    </AuthenticationVerificationProvider>
  </AuthenticationProvider>
);

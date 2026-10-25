import { AxiosError, type AxiosResponse } from "axios";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { withLoggedInAppLayout, withMockApi, type StoryApiRoute } from "@/storybook";
import { EmailVerificationView } from "./EmailVerificationView";

const resendRoute = (respond: StoryApiRoute["respond"]): StoryApiRoute => ({
  path: "/auth/verify-email/resend-current",
  method: "post",
  respond,
});

/** Main for a signed-in, unverified account: verification lantern + resend CTA instead of the path and input. */
const meta = {
  title: "Haiku/Main/EmailVerification",
  component: EmailVerificationView,
  decorators: [withLoggedInAppLayout],
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof EmailVerificationView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The CTA sends the email ("sent" toast). */
export const SendsEmail: Story = {
  decorators: [withMockApi([resendRoute(() => ({ ok: true, data: { status: "sent" } }))])],
};

/** Second click inside the API cooldown ("try again in a minute" toast). */
export const Cooldown: Story = {
  decorators: [
    withMockApi([
      resendRoute((config) => {
        const response = {
          status: 429,
          statusText: "Too Many Requests",
          data: { ok: false, code: "VERIFICATION_RESEND_COOLDOWN" },
          headers: {},
          config,
        } as AxiosResponse;
        throw new AxiosError("cooldown", "ERR_BAD_REQUEST", config, null, response);
      }),
    ]),
  ],
};

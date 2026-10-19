import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CelestialThemeProvider } from "@/app/providers/CelestialThemeProvider";
import { loadDevEmails, type DevEmails } from "./devEmails";
import { EmailStoryStage } from "./EmailStoryStage";
import type { EmailStoryArgs } from "./EmailStoryStage.types";

/**
 * Every email the API sends, rendered by its real template (GET /dev/emails, dev only) and shown
 * as Gmail would display it. Needs the API running (`STORYBOOK_API_URL`, default http://localhost:4000).
 */
const meta = {
  title: "Emails/Gmail",
  parameters: { layout: "fullscreen" },
  loaders: [async () => ({ devEmails: await loadDevEmails() })],
  decorators: [
    (Story) => (
      <CelestialThemeProvider>
        <Story />
      </CelestialThemeProvider>
    ),
  ],
  argTypes: {
    emailId: { control: false },
    viewport: { control: "inline-radio", options: ["desktop", "mobile"] },
    tab: { control: "inline-radio", options: ["html", "text"] },
  },
  args: { emailId: "verifyEmail", viewport: "desktop", tab: "html" },
  render: (args, { loaded }) => (
    <EmailStoryStage {...args} result={(loaded as { devEmails?: DevEmails }).devEmails} />
  ),
} satisfies Meta<EmailStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VerifyEmail: Story = { args: { emailId: "verifyEmail" } };
export const Welcome: Story = { args: { emailId: "welcome" } };
export const PasswordReset: Story = { args: { emailId: "passwordReset" } };
export const SignupAttemptAlert: Story = { args: { emailId: "signupAttemptAlert" } };
export const EmailChangeConfirm: Story = { args: { emailId: "emailChangeConfirm" } };
export const EmailChangeOldAddressAlert: Story = { args: { emailId: "emailChangeOldAddressAlert" } };
export const ShareHaikuPostcard: Story = { args: { emailId: "shareHaikuPostcard" } };
export const ShareHaikuText: Story = { args: { emailId: "shareHaikuText" } };

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfileInfoTab } from "./ProfileInfoTab";
import { ProfileProvider, type ProfileContextValue } from "../ProfileContext";

const meta = {
  title: "Profile/ProfileInfoTab",
  component: ProfileInfoTab,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
      const value: ProfileContextValue = {
        displayName: "Demo User",
        avatarUrl: "",
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        isGoogleUser: false,
        pendingEmailChange: null,
        emailDraft: "",
        resendEmailDraft: "",
        validEmailDraft: false,
        saving: false,
        savingAvatar: false,
        requestingEmailChange: false,
        resendingEmailChange: false,
        emailConfirmOpen: false,
        resendOpen: false,
        saveProfileLabel: "Save profile",
        onSaveProfile: async () => undefined,
        onAvatarUploaded: () => undefined,
        onEmailDraftChange: () => undefined,
        onResendEmailDraftChange: () => undefined,
        onOpenEmailConfirm: () => undefined,
        onCloseEmailConfirm: () => undefined,
        onConfirmEmailChange: () => undefined,
        onOpenResend: () => undefined,
        onCloseResend: () => undefined,
        onConfirmResend: () => undefined,
      };
      return (
        <ProfileProvider value={value}>
          <Story />
        </ProfileProvider>
      );
    },
  ],
} satisfies Meta<typeof ProfileInfoTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

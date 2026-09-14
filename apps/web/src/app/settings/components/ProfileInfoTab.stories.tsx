import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MockAuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import { PaddleProvider } from "@/app/providers/PaddleProvider";
import { ProfileInfoTab } from "./ProfileInfoTab";
import { ProfileProvider, type ProfileContextValue } from "../ProfileContext";
import type { AuthenticationResult } from "@/hooks/useAuthentication";

const profileValue: ProfileContextValue = {
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

const authValue: AuthenticationResult = {
  user: {
    id: "user-1",
    email: "demo@example.com",
    userName: "Demo User",
    firstName: "Demo",
    lastName: "User",
    avatar: "",
    avatarManuallySet: false,
    emailVerifiedAt: null,
    providers: [],
  },
  account: [],
  initialized: true,
  isLoggedIn: true,
  logout: async () => undefined,
  checkAuthentication: () => undefined,
};

const meta = {
  title: "Profile/ProfileInfoTab",
  component: ProfileInfoTab,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <MockAuthenticationProvider value={authValue}>
        <PaddleProvider>
          <AuthenticationVerificationProvider>
            <ProfileProvider value={profileValue}>
              <div style={{ width: "min(42rem, 100vw)", maxWidth: "42rem" }}>
                <Story />
              </div>
            </ProfileProvider>
          </AuthenticationVerificationProvider>
        </PaddleProvider>
      </MockAuthenticationProvider>
    ),
  ],
} satisfies Meta<typeof ProfileInfoTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

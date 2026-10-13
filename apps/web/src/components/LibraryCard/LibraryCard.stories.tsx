import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MockAuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import { PaddleProvider } from "@/app/providers/PaddleProvider";
import {
  ProfileProvider,
  type ProfileContextValue,
} from "@/app/settings/ProfileContext";
import type { AuthenticationResult } from "@/hooks/useAuthentication";
import { LibraryCard } from "./LibraryCard";

const profileValue: ProfileContextValue = {
  displayName: "Demo User",
  avatarUrl: "",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  saving: false,
  savingAvatar: false,
  saveProfileLabel: "Save profile",
  onSaveProfile: async () => undefined,
  onAvatarUploaded: () => undefined,
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
  title: "Profile/LibraryCard",
  component: LibraryCard,
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
} satisfies Meta<typeof LibraryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

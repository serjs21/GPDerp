import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import type { UserObject } from "@/types";
import { AuthProvider } from "@/types";

import { LoggedInUserNav } from "./LoggedInUserNav";

const avatarAristotle =
  "https://cdn.britannica.com/84/87984-050-7C5547FE/Detail-Roman-copy-portrait-bust-Aristotle-Greek.jpg";

function makeUser({
  userName,
  avatar,
}: {
  userName: string;
  avatar: string;
}): UserObject {
  return {
    id: "user-1",
    email: "user@example.com",
    userName,
    firstName: userName.split(" ")[0] ?? userName,
    lastName: userName.split(" ").slice(1).join(" "),
    avatar,
    avatarManuallySet: true,
    emailVerifiedAt: null,
    providers: [AuthProvider.LOCAL],
  };
}

const meta = {
  title: "Auth/AuthenticationNav/LoggedInUserNav",
  component: LoggedInUserNav,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    onLogout: fn(),
    user: makeUser({ userName: "Aristotle", avatar: avatarAristotle }),
  },
} satisfies Meta<typeof LoggedInUserNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongDisplayName: Story = {
  args: {
    user: makeUser({
      userName: "Sun-Tzu Sunzi: Master Strategist of the Art of War",
      avatar: avatarAristotle,
    }),
  },
};

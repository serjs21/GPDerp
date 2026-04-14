import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import type { UserObject } from "@/types";
import { AuthProvider } from "@/types";

import { LoggedInUserDropdown } from "./LoggedInUserDropdown";

const avatarAristotle =
  "https://cdn.britannica.com/84/87984-050-7C5547FE/Detail-Roman-copy-portrait-bust-Aristotle-Greek.jpg";
const avatarPlato =
  "https://images.imagerenderer.com/images-medium-large/plato-ancient-greek-philosopher-sheila-terry.jpg";
const avatarSunzi =
  "https://cdn.britannica.com/36/259536-050-C6DC3D1F/Sunzi-Sun-Tzu-Chinese-strategist-Art-of-War.jpg";

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
  title: "Auth/AuthenticationNav/LoggedInUserDropdown",
  component: LoggedInUserDropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    onLogout: fn(),
  },
} satisfies Meta<typeof LoggedInUserDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShortDisplayNameWithAvatar: Story = {
  args: {
    user: makeUser({ userName: "Aristotle", avatar: avatarAristotle }),
  },
};

export const LongDisplayNameWithAvatar: Story = {
  args: {
    user: makeUser({
      userName: "Plato the Philosopher",
      avatar: avatarPlato,
    }),
  },
};

export const ExtraLongDisplayNameWithAvatar: Story = {
  args: {
    user: makeUser({
      userName: "Sun-Tzu Sunzi: Master Strategist of the Art of War",
      avatar: avatarSunzi,
    }),
  },
};

export const ShortDisplayNameWithoutAvatar: Story = {
  args: {
    user: makeUser({ userName: "Aristotle", avatar: "" }),
  },
};

export const LongDisplayNameWithoutAvatar: Story = {
  args: {
    user: makeUser({
      userName: "Plato the Philosopher",
      avatar: "",
    }),
  },
};

export const ExtraLongDisplayNameWithoutAvatar: Story = {
  args: {
    user: makeUser({
      userName: "Sun-Tzu Sunzi: Master Strategist of the Art of War",
      avatar: "",
    }),
  },
};


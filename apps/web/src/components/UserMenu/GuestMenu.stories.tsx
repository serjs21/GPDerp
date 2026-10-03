import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { withAuthProviders } from "@/storybook/decorators/withAuthProviders";
import { GuestMenu } from "./GuestMenu";

const meta = {
  title: "Auth/GuestMenu",
  component: GuestMenu,
  tags: ["autodocs"],
  decorators: [withAuthProviders],
  parameters: {
    layout: "centered",
    nextjs: {
      navigation: {
        pathname: "/share/abc123",
      },
    },
  },
} satisfies Meta<typeof GuestMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnSharePage: Story = {
  name: "On share page (Go home + Login)",
};

export const OnHomePage: Story = {
  name: "On home page (Login only)",
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
  },
};

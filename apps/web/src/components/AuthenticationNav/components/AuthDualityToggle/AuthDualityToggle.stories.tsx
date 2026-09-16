import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { composeDecorators, withThemedStoryStage } from "@/storybook";
import { AuthDualityToggle } from "./AuthDualityToggle";

const meta = {
  title: "Components/AuthenticationNav/AuthDualityToggle",
  component: AuthDualityToggle,
  tags: ["autodocs"],
  decorators: [composeDecorators(withThemedStoryStage)],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Animated dual-option auth toggle used in header navigation.",
      },
    },
  },
} satisfies Meta<typeof AuthDualityToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AuthDualityToggle />,
};

export const SquareCorners: Story = {
  render: () => <AuthDualityToggle borderRadius={0} width={220} />,
};

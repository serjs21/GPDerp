import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { composeDecorators, withThemedStoryStage } from "@/storybook";
import { AuthDualityToggleDemo } from "./AuthDualityToggleDemo";

const meta = {
  title: "Archive/Components/AuthenticationNav/AuthDualityToggleDemo",
  component: AuthDualityToggleDemo,
  tags: ["autodocs"],
  decorators: [composeDecorators(withThemedStoryStage)],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AuthDualityToggleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AuthDualityToggleDemo />,
};

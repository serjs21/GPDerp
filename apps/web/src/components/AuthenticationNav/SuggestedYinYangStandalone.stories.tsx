import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SuggestedYinYangPill } from "../../../local/suggested-yinyang-standalone/SuggestedYinYangPill";
import { SuggestedYinYangHoverLayout } from "../../../local/suggested-yinyang-standalone/SuggestedYinYangHoverLayout";

const meta = {
  title: "Suggested/AuthenticationNav/MinimalStandaloneAnimated",
  component: SuggestedYinYangPill,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Standalone minimal animated yin-yang auth pill from local prototype folder (isolated from app implementation). Hover Login/Register to animate.",
      },
    },
  },
} satisfies Meta<typeof SuggestedYinYangPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Animated: Story = {};

export const WithBackgroundSideComponent: Story = {
  render: () => <SuggestedYinYangHoverLayout />,
};


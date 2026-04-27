import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SuggestedLineOnlyButton } from "../../../local/suggested-yinyang-standalone/SuggestedLineOnlyButton";
import { SuggestedSquareBackgroundOnly } from "../../../local/suggested-yinyang-standalone/SuggestedSquareBackgroundOnly";

const meta = {
  title: "Suggested/AuthenticationNav/MinimalStandaloneAnimated",
  component: SuggestedSquareBackgroundOnly,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Standalone minimal DaoRotation-based prototype stories.",
      },
    },
  },
} satisfies Meta<typeof SuggestedSquareBackgroundOnly>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LineWithSquareBackground: Story = {
  render: () => (
    <div className="yy-line-square-row">
      <SuggestedLineOnlyButton />
      <SuggestedSquareBackgroundOnly />
    </div>
  ),
};


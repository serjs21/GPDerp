import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OverlayPrevLabel } from "./OverlayPrevLabel";
import styles from "./OverlayPrevLabel.stories.module.css";

const meta = {
  title: "Haiku/PathOverlay/OverlayPrevLabel",
  component: OverlayPrevLabel,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof OverlayPrevLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className={styles.stage}>
      <OverlayPrevLabel {...args} />
    </div>
  ),
};

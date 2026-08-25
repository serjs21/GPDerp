import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OverlayNextLabel } from "./OverlayNextLabel";
import styles from "./OverlayNextLabel.stories.module.css";

const meta = {
  title: "Haiku/PathOverlay/OverlayNextLabel",
  component: OverlayNextLabel,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof OverlayNextLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className={styles.stage}>
      <OverlayNextLabel {...args} />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CopyText } from "./CopyText";
import styles from "./CopyText.module.css";

const meta = {
  title: "Haiku/CopyText",
  component: CopyText,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className={styles.storyShell}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CopyText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AsLink: Story = {
  args: {
    text: "https://example.com/share/demo-token",
    mode: "link",
  },
};

export const PlainText: Story = {
  args: {
    text: "Plain snippet to copy — no link behavior.",
    mode: "text",
  },
};

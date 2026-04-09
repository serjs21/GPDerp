import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SharedHaikuTyping } from "./SharedHaikuTyping";
import styles from "./SharedHaikuTyping.module.css";

const meta = {
  title: "Share/SharedHaikuTyping",
  component: SharedHaikuTyping,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className={styles.storyShell}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SharedHaikuTyping>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Moonlit Garden",
    body: "Wind strokes cedar bark\nPaper lanterns hum in dusk\nTea cools by the gate",
  },
};

export const Multiline: Story = {
  args: {
    title: "Rain Notes",
    body: "Rooftop rain is drums\n\nA train sighs through wet midnight\nStreetlight ink runs gold",
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import { getThemeScaleVars } from "@/theme/themeScale";
import { DaylightBackgroundView } from "./DaylightBackground";
import styles from "./DaylightBackground.stories.module.css";

const meta: Meta<typeof DaylightBackgroundView> = {
  title: "Layout/DaylightBackground",
  component: DaylightBackgroundView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DaylightBackgroundView>;

const InteractiveBackground = ({ initialProgress }: { initialProgress: number }) => {
  const [progress, setProgress] = useState(initialProgress);
  const themeVars = getThemeScaleVars(progress);

  return (
    <div className={styles.stage} style={themeVars as CSSProperties}>
      <DaylightBackgroundView progress={progress} />
      <div className={styles.controls}>
        <label className={styles.label} htmlFor="daylight-progress">
          Theme scale: {Math.round(progress)}% (0 = day, 100 = night)
        </label>
        <input
          id="daylight-progress"
          className={styles.slider}
          type="range"
          min={0}
          max={100}
          step={1}
          value={progress}
          onChange={(event) => setProgress(Number(event.target.value))}
        />
      </div>
    </div>
  );
};

export const Day: Story = {
  render: () => <InteractiveBackground initialProgress={0} />,
};

export const Twilight: Story = {
  render: () => <InteractiveBackground initialProgress={50} />,
};

export const Night: Story = {
  render: () => <InteractiveBackground initialProgress={100} />,
};

export const ScaleProgression: Story = {
  render: () => <InteractiveBackground initialProgress={35} />,
};

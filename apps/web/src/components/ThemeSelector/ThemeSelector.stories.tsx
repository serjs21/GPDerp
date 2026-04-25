import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { ThemeName } from "@/config/userConfiguration";
import { ThemeSelector } from "./ThemeSelector";

const meta: Meta<typeof ThemeSelector> = {
  title: "Auth/ThemeSelector",
  component: ThemeSelector,
  args: {
    ariaLabel: "Theme",
  },
};

export default meta;
type Story = StoryObj<typeof ThemeSelector>;

const InteractiveSelector = ({ initialTheme }: { initialTheme: ThemeName }) => {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [preview, setPreview] = useState<number | null>(null);
  return (
    <div style={{ padding: "1rem", maxWidth: "280px" }}>
      <ThemeSelector value={theme} onChange={setTheme} onPreviewChange={setPreview} />
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>Current: {theme}</p>
      <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", opacity: 0.75 }}>
        Slider: {preview ?? (theme === "sumie" ? 0 : theme === "tokyo-dusk" ? 75 : 100)}%
      </p>
    </div>
  );
};

export const Bright: Story = {
  render: () => <InteractiveSelector initialTheme="sumie" />,
};

export const Mid: Story = {
  render: () => <InteractiveSelector initialTheme="tokyo-dusk" />,
};

export const Dark: Story = {
  render: () => <InteractiveSelector initialTheme="night-sky" />,
};

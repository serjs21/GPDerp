import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComicLabelText } from "./ComicLabelText";

const meta = {
  title: "Haiku/ComicLabelText",
  component: ComicLabelText,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    text: "POW!",
    color: "#ffffff",
    outlineColor: "#000000",
    outlineWidth: 3,
    size: "md",
  },
} satisfies Meta<typeof ComicLabelText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    text: "ZAP",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    text: "BOOM",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    text: "KABAM",
    size: "lg",
  },
};

const COLOR_VARIANTS = [
  { name: "White", color: "#ffffff" },
  { name: "Red", color: "#ff0000" },
  { name: "Yellow", color: "#ffff00" },
  { name: "Green", color: "#00ff00" },
  { name: "Blue", color: "#0000ff" },
  { name: "Orange", color: "#ff8800" },
  { name: "Purple", color: "#ff00ff" },
  { name: "Cyan", color: "#00ffff" },
] as const;

export const ColorVariants: Story = {
  name: "Color variants",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        maxWidth: "32rem",
      }}
    >
      {COLOR_VARIANTS.map((variant) => (
        <div key={variant.color} style={{ textAlign: "center" }}>
          <ComicLabelText
            text={variant.name.toUpperCase()}
            color={variant.color}
            outlineColor="#000000"
            size="md"
          />
        </div>
      ))}
    </div>
  ),
};

export const SizeVariants: Story = {
  name: "Size variants",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div>
        <ComicLabelText text="SMALL" size="sm" />
      </div>
      <div>
        <ComicLabelText text="MEDIUM" size="md" />
      </div>
      <div>
        <ComicLabelText text="LARGE" size="lg" />
      </div>
    </div>
  ),
};

export const CustomOutline: Story = {
  name: "Custom outline (red)",
  args: {
    text: "WHAM",
    color: "#ffff00",
    outlineColor: "#ff0000",
    outlineWidth: 4,
    size: "lg",
  },
};

export const ThickOutline: Story = {
  name: "Thick outline",
  args: {
    text: "CRASH",
    color: "#ffffff",
    outlineColor: "#000000",
    outlineWidth: 5,
    size: "lg",
  },
};

export const OnDarkBackground: Story = {
  name: "On dark background",
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
      }}
    >
      <ComicLabelText
        text="THUD!"
        color="#ffff00"
        outlineColor="#ffffff"
        outlineWidth={3}
        size="lg"
      />
    </div>
  ),
};

export const AllTogether: Story = {
  name: "Gallery",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
        gap: "2rem",
        padding: "2rem",
        width: "min(100%, 56rem)",
      }}
    >
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <ComicLabelText text="POW!" color="#ffffff" outlineColor="#000000" size="md" />
      </div>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <ComicLabelText text="BAM!" color="#ff0000" outlineColor="#000000" size="md" />
      </div>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <ComicLabelText text="ZAP!" color="#ffff00" outlineColor="#000000" size="md" />
      </div>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <ComicLabelText text="BOOM!" color="#00ff00" outlineColor="#000000" size="md" />
      </div>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <ComicLabelText text="CRASH!" color="#0000ff" outlineColor="#ffffff" size="md" />
      </div>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <ComicLabelText text="KABAM!" color="#ff8800" outlineColor="#000000" size="lg" />
      </div>
    </div>
  ),
};

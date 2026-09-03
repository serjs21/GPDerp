import { useCallback, useRef, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { COMIC_SOURCE_DIRECTIONS } from "@/components/ComicConfirmModal";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import { resolveComicLabelFill } from "./comicLabelColors";
import { sourceDirectionFromOutwardAngle } from "@/components/Lantern/lanternLabelRingLayout";
import type { ComicalBubbleTarget } from "@/components/ComicConfirmModal/useComicalBubbles";
import { ComicLabel } from "./ComicLabel";

const meta = {
  title: "Haiku/ComicLabel",
  component: ComicLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    name: "Morning mist",
    color: "#1677ff",
    sourceDirection: "left",
  },
} satisfies Meta<typeof ComicLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LeftTail: Story = {
  args: {
    name: "Zen",
    color: "#ffffff",
    sourceDirection: "left",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "2rem", background: "#eb2f96" }}>
        <Story />
      </div>
    ),
  ],
};

const CONTRAST_SAMPLES = [
  { name: "White", color: "#ffffff" },
  { name: "Near black", color: "#17131A" },
  { name: "Blue", color: "#1677ff" },
  { name: "Green", color: "green" },
  { name: "Gold", color: "#faad14" },
  { name: "Purple", color: "purple" },
  { name: "Cyan", color: "#13c2c2" },
  { name: "Default", color: "default" },
] as const;

export const ContrastGallery: Story = {
  name: "Contrast gallery",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        maxWidth: "40rem",
      }}
    >
      {CONTRAST_SAMPLES.map((sample) => (
        <ComicLabel
          key={sample.color}
          name={sample.name}
          color={sample.color}
          sourceDirection="left"
        />
      ))}
    </div>
  ),
};

export const AllDirections: Story = {
  name: "All directions",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
        gap: "1.25rem",
        width: "min(100%, 42rem)",
      }}
    >
      {COMIC_SOURCE_DIRECTIONS.map((direction) => (
        <ComicLabel key={direction} name={direction} color="#fff9c4" sourceDirection={direction} />
      ))}
    </div>
  ),
};

const TEXT_LENGTH_SAMPLES = [
  { name: "A", color: "#1677ff" },
  { name: "Hi", color: "#52c41a" },
  { name: "Morning", color: "#faad14" },
  { name: "Morning mist", color: "#eb2f96" },
  { name: "Late autumn morning", color: "#722ed1" },
  { name: "Soft golden hour light", color: "#fa541c" },
] as const;

export const TextLengths: Story = {
  name: "Text lengths",
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
      {TEXT_LENGTH_SAMPLES.map((sample) => (
        <ComicLabel
          key={sample.name}
          name={sample.name}
          color={sample.color}
          sourceDirection="bottom"
        />
      ))}
    </div>
  ),
};

type CircleLabel = {
  id: string;
  name: string;
  color: string;
};

function CircleAroundDotAnchorStage() {
  const targetRefs = useRef(new Map<string, HTMLElement | null>());
  const stageRef = useRef<HTMLDivElement | null>(null);

  const labels: CircleLabel[] = [
    { id: "top-left", name: "Zen", color: "#1677ff" },
    { id: "top", name: "Peace", color: "#52c41a" },
    { id: "top-right", name: "Harmony", color: "#faad14" },
    { id: "bottom-right", name: "Wonder", color: "#eb2f96" },
    { id: "bottom-left", name: "Serenity", color: "#722ed1" },
  ];

  const RING_RADIUS = 0.35; // Proportion of stage size
  const START_ANGLE = (-3 * Math.PI) / 4; // Top-left (-135 degrees)

  const slots = labels.map((label, index) => {
    const angle = START_ANGLE + (index * 2 * Math.PI) / labels.length;
    const sourceDirection = sourceDirectionFromOutwardAngle(angle);
    const x = 50 + Math.cos(angle) * RING_RADIUS * 100;
    const y = 50 + Math.sin(angle) * RING_RADIUS * 100;
    return { label, angle, sourceDirection, x, y };
  });

  const targetsKey = slots
    .map((slot) => `${slot.label.id}:${slot.sourceDirection}:${resolveComicLabelFill(slot.label.color)}`)
    .join("|");

  const getTargets = useCallback(
    (): ComicalBubbleTarget[] =>
      slots.map((slot) => ({
        element: targetRefs.current.get(slot.label.id) ?? null,
        style: "speech" as const,
        sourceDirection: slot.sourceDirection,
        backgroundColors: [resolveComicLabelFill(slot.label.color)],
      })),
    [slots],
  );

  const setTargetRef = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      targetRefs.current.set(id, node);
    } else {
      targetRefs.current.delete(id);
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "24rem",
        height: "24rem",
        margin: "2rem auto",
      }}
    >
      <ComicBubbleStage
        ref={stageRef}
        active
        targetsKey={targetsKey}
        getTargets={getTargets}
        className=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          padding: "2.5rem",
          boxSizing: "border-box",
        } as CSSProperties}
      >
        {/* Center dot anchor */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "50%",
            backgroundColor: "#2d2d2d",
            zIndex: 10,
          }}
          aria-label="Circle anchor"
        />

        {/* Labels around the circle */}
        {slots.map((slot) => (
          <ComicLabel
            key={slot.label.id}
            ref={(node) => setTargetRef(slot.label.id, node)}
            mode="embedded"
            name={slot.label.name}
            color={slot.label.color}
            sourceDirection={slot.sourceDirection}
            style={{
              position: "absolute",
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              transform: "translate(-50%, -50%)",
              margin: 0,
              width: "max-content",
              pointerEvents: "none",
            } as CSSProperties}
          />
        ))}
      </ComicBubbleStage>
    </div>
  );
}

export const CircleAroundDotAnchor: Story = {
  name: "Circle around dot anchor",
  render: () => <CircleAroundDotAnchorStage />,
  parameters: {
    layout: "centered",
  },
};

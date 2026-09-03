import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { COMIC_SOURCE_DIRECTIONS } from "@/components/ComicConfirmModal";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import { COMIC_LABEL_DEFAULT_BUBBLE_STYLE } from "./comicLabelBubblePresets";
import { resolveComicLabelFill } from "./comicLabelColors";
import { sourceDirectionFromOutwardAngle } from "@/components/Lantern/lanternLabelRingLayout";
import type { ComicalBubbleTarget } from "@/components/ComicConfirmModal/useComicalBubbles";
import { ComicLabel } from "./ComicLabel";
import styles from "./ComicLabel.stories.module.css";

const meta = {
  title: "Haiku/ComicLabel",
  component: ComicLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className={styles.canvas}>
        <Story />
      </div>
    ),
  ],
  args: {
    name: "POW!",
    color: "#13c2c2",
    bubbleStyle: COMIC_LABEL_DEFAULT_BUBBLE_STYLE,
    sourceDirection: "none",
  },
} satisfies Meta<typeof ComicLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LeftTail: Story = {
  args: {
    name: "Zen",
    color: "#ffffff",
    bubbleStyle: "speech",
    sourceDirection: "left",
  },
  decorators: [
    (Story) => (
      <div className={styles.canvasPink}>
        <Story />
      </div>
    ),
  ],
};

const BURST_SAMPLES = [
  { name: "POW!", color: "#faad14" },
  { name: "WOW!", color: "#13c2c2" },
  { name: "OMG!", color: "#ffffff" },
  { name: "BANG!", color: "#52c41a" },
  { name: "ZAP!", color: "#1677ff" },
  { name: "WHAM!", color: "#eb2f96" },
] as const;

export const BurstGallery: Story = {
  name: "Burst gallery",
  render: () => (
    <div className={styles.gallery}>
      {BURST_SAMPLES.map((sample) => (
        <ComicLabel key={sample.name} name={sample.name} color={sample.color} />
      ))}
    </div>
  ),
};

export const SpeechVariant: Story = {
  name: "Speech variant",
  render: () => (
    <div className={styles.gallery}>
      {BURST_SAMPLES.slice(0, 4).map((sample) => (
        <ComicLabel
          key={sample.name}
          name={sample.name}
          color={sample.color}
          bubbleStyle="speech"
          sourceDirection="bottom"
        />
      ))}
    </div>
  ),
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
    <div className={styles.galleryWide}>
      {CONTRAST_SAMPLES.map((sample) => (
        <ComicLabel key={sample.color} name={sample.name} color={sample.color} />
      ))}
    </div>
  ),
};

export const AllDirections: Story = {
  name: "All directions (speech)",
  render: () => (
    <div className={styles.directionGrid}>
      {COMIC_SOURCE_DIRECTIONS.map((direction) => (
        <ComicLabel
          key={direction}
          name={direction}
          color="#fff9c4"
          bubbleStyle="speech"
          sourceDirection={direction}
        />
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
    <div className={styles.lengthColumn}>
      {TEXT_LENGTH_SAMPLES.map((sample) => (
        <ComicLabel key={sample.name} name={sample.name} color={sample.color} />
      ))}
    </div>
  ),
};

type CircleLabel = {
  id: string;
  name: string;
  color: string;
};

const CIRCLE_LABELS: CircleLabel[] = [
  { id: "top-left", name: "POW!", color: "#1677ff" },
  { id: "top", name: "WOW!", color: "#52c41a" },
  { id: "top-right", name: "ZAP!", color: "#faad14" },
  { id: "bottom-right", name: "BANG!", color: "#eb2f96" },
  { id: "bottom-left", name: "OMG!", color: "#722ed1" },
];

const CIRCLE_RING_RADIUS = 0.35;
const CIRCLE_START_ANGLE = (-3 * Math.PI) / 4;

function CircleAroundDotAnchorStage() {
  const targetRefs = useRef(new Map<string, HTMLElement | null>());
  const stageRef = useRef<HTMLDivElement | null>(null);
  /** Pixel top-left so label center sits on ring point — no CSS transform (comical uses offset*). */
  const [slotOrigins, setSlotOrigins] = useState<Record<string, { left: number; top: number }>>({});

  const slots = useMemo(
    () =>
      CIRCLE_LABELS.map((label, index) => {
        const angle = CIRCLE_START_ANGLE + (index * 2 * Math.PI) / CIRCLE_LABELS.length;
        const sourceDirection = sourceDirectionFromOutwardAngle(angle);
        const x = 50 + Math.cos(angle) * CIRCLE_RING_RADIUS * 100;
        const y = 50 + Math.sin(angle) * CIRCLE_RING_RADIUS * 100;
        return { label, sourceDirection, x, y };
      }),
    [],
  );

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const next: Record<string, { left: number; top: number }> = {};
    for (const slot of slots) {
      const el = targetRefs.current.get(slot.label.id);
      if (!el) continue;
      const centerX = (slot.x / 100) * stage.clientWidth;
      const centerY = (slot.y / 100) * stage.clientHeight;
      next[slot.label.id] = {
        left: Math.round(centerX - el.offsetWidth / 2),
        top: Math.round(centerY - el.offsetHeight / 2),
      };
    }

    setSlotOrigins((prev) => {
      const prevKey = Object.entries(prev)
        .map(([id, origin]) => `${id}:${origin.left},${origin.top}`)
        .join("|");
      const nextKey = Object.entries(next)
        .map(([id, origin]) => `${id}:${origin.left},${origin.top}`)
        .join("|");
      return prevKey === nextKey ? prev : next;
    });
  }, [slots]);

  const originsKey = Object.entries(slotOrigins)
    .map(([id, origin]) => `${id}:${origin.left},${origin.top}`)
    .join("|");

  const targetsKey = [
    slots
      .map(
        (slot) =>
          `${slot.label.id}:${slot.sourceDirection}:${resolveComicLabelFill(slot.label.color)}`,
      )
      .join("|"),
    originsKey,
  ].join("::");

  const getTargets = useCallback(
    (): ComicalBubbleTarget[] =>
      slots.map((slot) => ({
        element: targetRefs.current.get(slot.label.id) ?? null,
        style: COMIC_LABEL_DEFAULT_BUBBLE_STYLE,
        sourceDirection: "none",
        backgroundColors: [resolveComicLabelFill(slot.label.color)],
        variant: "label",
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
    <div className={styles.circleStage}>
      <ComicBubbleStage
        ref={stageRef}
        active
        targetsKey={targetsKey}
        getTargets={getTargets}
        className={styles.circleBubbleStage}
      >
        <div className={styles.circleAnchor} aria-label="Circle anchor" />
        {slots.map((slot) => {
          const origin = slotOrigins[slot.label.id];
          return (
            <ComicLabel
              key={slot.label.id}
              ref={(node) => setTargetRef(slot.label.id, node)}
              mode="embedded"
              name={slot.label.name}
              color={slot.label.color}
              sourceDirection="none"
              style={
                {
                  position: "absolute",
                  left: origin ? `${origin.left}px` : `${slot.x}%`,
                  top: origin ? `${origin.top}px` : `${slot.y}%`,
                  transform: "none",
                  margin: 0,
                  width: "max-content",
                  pointerEvents: "none",
                } as CSSProperties
              }
            />
          );
        })}
      </ComicBubbleStage>
    </div>
  );
}

export const CircleAroundDotAnchor: Story = {
  name: "Circle around dot anchor",
  render: () => <CircleAroundDotAnchorStage />,
};

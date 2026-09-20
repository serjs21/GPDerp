"use client";

import { useState, type CSSProperties } from "react";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternRotatedVariantId } from "@/components/Lantern/consts/rotationBaseConsts";
import { HAIKU_MAX_LINE_CHARS, parseHaikuBody } from "@/utils/parseHaikuBody";
import styles from "./ConnectedLanternStack.module.css";

const LANTERN_WIDTH_REM = 4.6;
const FAN_STEP_REM = 2.85;
/** Cursive em-width so a max-length line stays on one row in the preview. */
const PREVIEW_CHAR_EM = 0.58;

function previewLanternBodyStyle(body: string) {
  const longest = Math.max(
    ...parseHaikuBody(body).lines.map((line) => line.length),
    1,
  );
  const fitChars = Math.min(HAIKU_MAX_LINE_CHARS, Math.max(longest, 8));
  return {
    "--lantern-body-font-size": `clamp(0.28rem, calc(100cqi / ${fitChars * PREVIEW_CHAR_EM}), 0.72rem)`,
  } as CSSProperties;
}

const transformsMap = {
  0: `translate(-50%, -60%) `,
  1: `translate(-125%, -65%) scale(0.5)`,
  2: `translate(10%, -75%) scale(0.2)`,
};

const rotationMap: Record<number, LanternRotatedVariantId | undefined> = {
  0: undefined,
  1: "rotated",
  2: "rotated2",
};

function fanOffsetRem(index: number, hovered: number | null, count: number): number {
  if (hovered == null || index === hovered || count < 2) return 0;
  const others = Array.from({ length: count }, (_, i) => i).filter((i) => i !== hovered);
  const pos = others.indexOf(index);
  if (pos < 0) return 0;
  const side = pos % 2 === 0 ? -1 : 1;
  const depth = Math.floor(pos / 2) + 1;
  return side * depth * FAN_STEP_REM;
}

export type ConnectedLanternStackProps = {
  accountId: string;
  items: LabelConnectedHaikuPreview[];
};

export function ConnectedLanternStack({ accountId, items }: ConnectedLanternStackProps) {
  const [stackActive, setStackActive] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const fanActive = stackActive && items.length > 1;

  return (
    <div
      className={styles.lanternStack}
      data-count={items.length}
      data-active={fanActive ? "true" : undefined}
      onMouseEnter={() => setStackActive(true)}
      onMouseLeave={() => {
        setStackActive(false);
        setHovered(null);
      }}
    >
      {items.map((haiku, index) => {
        let offsetRem = 0;
        if (fanActive) {
          if (hovered != null) {
            offsetRem = fanOffsetRem(index, hovered, items.length);
          } else {
            // Peek all lanterns so lower ones become hoverable.
            const peekSlots =
              items.length === 2
                ? [-FAN_STEP_REM * 0.7, FAN_STEP_REM * 0.7]
                : [-FAN_STEP_REM, 0, FAN_STEP_REM];
            offsetRem = peekSlots[index] ?? 0;
          }
        }
        const isHovered = hovered === index;
        const rotationBase = rotationMap[index];
        const baseTransform =
          transformsMap[index as keyof typeof transformsMap] ?? "translate(-50%, -60%)";
        const lanternHaiku = {
          id: haiku.id,
          title: haiku.title,
          titleSuffix: 0,
          body: haiku.body,
          createdAt: "",
          accountId,
          createdById: "",
          labels: [],
        };
        const lantern = (
          <Lantern
            haiku={lanternHaiku}
            rotationBase={rotationBase}
            showActions={false}
            bodyOnly
            className={styles.previewLantern}
            style={previewLanternBodyStyle(haiku.body)}
            widthRem={LANTERN_WIDTH_REM}
            ariaLabel={`Haiku lantern: ${haiku.title}`}
          />
        );

        return (
          <div
            key={haiku.id}
            className={styles.lanternStackItem}
            style={{
              zIndex: isHovered ? 20 : items.length - index,
              transform:
                offsetRem === 0
                  ? baseTransform
                  : `${baseTransform} translateX(${offsetRem}rem)`,
            }}
            onMouseEnter={() => setHovered(index)}
          >
            {rotationBase ? (
              lantern
            ) : (
              <LanternFrame
                ariaLabel={`Haiku lantern: ${haiku.title}`}
                className={styles.lanternFrame}
                widthRem={LANTERN_WIDTH_REM}
              >
                {lantern}
              </LanternFrame>
            )}
          </div>
        );
      })}
    </div>
  );
}

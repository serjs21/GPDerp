"use client";

import type { CSSProperties } from "react";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternRotatedVariantId } from "@/components/Lantern/consts/rotationBaseConsts";
import { HAIKU_MAX_LINE_CHARS, parseHaikuBody } from "@/utils/parseHaikuBody";
import styles from "./ConnectedLanternStack.module.css";

const LANTERN_WIDTH_REM = 6.6;
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
  0: `translate(-50%, -50%)`,
  1: `translate(-175%, -55%) scale(0.5)`,
  2: `translate(75%, -65%) scale(0.2)`,
};

const rotationMap: Record<number, LanternRotatedVariantId | undefined> = {
  0: undefined,
  1: "rotated",
  2: "rotated2",
};

export type ConnectedLanternStackProps = {
  accountId: string;
  items: LabelConnectedHaikuPreview[];
};

export function ConnectedLanternStack({ accountId, items }: ConnectedLanternStackProps) {
  return (
    <div className={styles.lanternStack} data-count={items.length}>
      {items.map((haiku, index) => {
        const rotationBase = rotationMap[index];
        const transform =
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
            mirrored={index === 2}
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
              zIndex: items.length - index,
              transform,
            }}
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

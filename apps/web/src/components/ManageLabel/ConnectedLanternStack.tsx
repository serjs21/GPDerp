"use client";

import type { CSSProperties } from "react";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternRotatedVariantId } from "@/components/Lantern/consts/rotationBaseConsts";
import { buildPreviewLanternTypographyStyle } from "@/components/Lantern/utils/previewLanternTypography";
import styles from "./ConnectedLanternStack.module.css";

const LANTERN_WIDTH_REM = 6.6;
const NOT_CONNECTED_SRC = "/profile/label_actions/not_connected.svg";

function previewLanternBodyStyle(body: string, title?: string): CSSProperties {
  return buildPreviewLanternTypographyStyle(body, {
    title,
    minBodyRem: 0.26,
    maxBodyRem: 0.62,
    maxTitleRem: 0.58,
    maxAuthorRem: 0.42,
  });
}

const transformsMap = {
  0: `translate(-50%, -50%)`,
  1: `translate(-155%, -55%) scale(0.5)`,
  2: `translate(35%, -65%) scale(0.2)`,
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
  if (items.length === 0) {
    return (
      <div className={styles.emptyState} data-count={0}>
        <p className={styles.emptyCaption}>not connected</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.emptyIcon}
          src={NOT_CONNECTED_SRC}
          alt=""
          draggable={false}
          decoding="async"
        />
      </div>
    );
  }

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
            style={previewLanternBodyStyle(haiku.body, haiku.title)}
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

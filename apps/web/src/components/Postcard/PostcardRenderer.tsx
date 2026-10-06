"use client";

import { useMemo } from "react";
import {
  BackgroundScene,
  colorBalanceFromThemeSelection,
} from "@/components/BackgroundScene";
import { LanternFrame } from "@/components/Lantern";
import { formatCreatedOn } from "@/utils/date";
import { parseHaikuBody } from "@/utils/parseHaikuBody";
import { formatHaikuTitle } from "@/utils/strings";
import { PostcardHaikuText } from "./PostcardHaikuText";
import type { PostcardRendererProps } from "./PostcardRenderer.types";
import {
  buildPostcardLanternStyle,
  buildPostcardRootStyle,
} from "./utils/postcardStyleUtils";
import styles from "./PostcardRenderer.module.css";

/** Fixed 1200×800 static postcard composition (capture target, no interactivity). */
export function PostcardRenderer({ theme, haiku, fontScale, className, ref }: PostcardRendererProps) {
  const { scene, backgroundBodies } = theme;
  const balance = useMemo(
    () =>
      colorBalanceFromThemeSelection({
        theme: scene.theme,
        solarElevationDeg: scene.layout.sun.altitudeDeg,
      }),
    [scene.theme, scene.layout.sun.altitudeDeg],
  );

  const { lines, author } = parseHaikuBody(haiku.body);
  const title = haiku.title?.trim() ? formatHaikuTitle(haiku) : undefined;
  const createdOn = haiku.createdAt ? formatCreatedOn(haiku.createdAt) : undefined;
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={rootClass}
      style={buildPostcardRootStyle(scene.sceneVars)}
      data-postcard-root=""
    >
      <BackgroundScene
        theme={scene.theme}
        backgroundBodies={backgroundBodies}
        colorBalance={balance.global}
        mountainColorBalance={balance.mountain}
      />
      <div className={styles.lanternSlot}>
        <LanternFrame
          ariaLabel={title ? `Haiku postcard: ${title}` : "Haiku postcard"}
          suppressReveal
          showLabelBelt={false}
          style={buildPostcardLanternStyle()}
        >
          <PostcardHaikuText lines={lines} title={title} author={author} fontScale={fontScale} />
        </LanternFrame>
      </div>
      {createdOn ? <p className={styles.date}>{createdOn}</p> : null}
    </div>
  );
}

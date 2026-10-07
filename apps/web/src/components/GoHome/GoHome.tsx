"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { HEADER_NAV_ICON_SIZE_PX } from "@/consts/header/siteHeaderConsts";
import styles from "./GoHome.module.css";

/** Match UserMenu / header tool button comic frame height. */
const PANEL_HEIGHT_PX = HEADER_NAV_ICON_SIZE_PX;

const GO_BACK_ICON_SRC = "/nav/go_back.svg";

export type GoHomeProps = {
  className?: string;
  /** Force render even on `/` (Storybook). */
  forceShow?: boolean;
};

/**
 * Header “go home” control — same ComicBurstLabel shell as the header tool buttons /
 * UserMenu. Hover expands a zero-width label and pushes the centered icon left.
 */
export function GoHome({ className, forceShow = false }: GoHomeProps) {
  const pathname = usePathname();
  const sharpShape = resolveComicLabelShapePreset("sharp");

  // Share pages use the menu's "Go home" row instead.
  if (
    !forceShow &&
    (pathname === "/" || pathname.startsWith("/settings") || pathname.startsWith("/share/"))
  ) {
    return null;
  }

  return (
    <div
      className={`${styles.anchor}${className ? ` ${className}` : ""}`}
    >
      <div className={styles.shell}>
        <ComicBurstLabel
          className={styles.frame}
          text=""
          shapeKind={sharpShape.kind}
          spikeCount={sharpShape.spikeCount}
          randomness={sharpShape.randomness}
          seed={sharpShape.id}
          fontSize={PANEL_HEIGHT_PX}
          paddingX={52}
          paddingY={0}
          strokeWidth={3}
          fill="#f7f4ef"
        >
          <span aria-hidden />
        </ComicBurstLabel>

        <Link
          href="/"
          prefetch
          className={styles.panel}
          aria-label="Go home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- public SVG asset */}
          <img
            className={styles.actionIcon}
            src={GO_BACK_ICON_SRC}
            alt=""
            draggable={false}
            width={120}
            height={48}
          />
          <span className={styles.actionFooter} aria-hidden>
            Go home
          </span>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useId } from "react";
import { PAPER_COLORS } from "./paperTokens";
import styles from "./PaperModal.module.css";

export type PaperSurfaceProps = {
  /** Stable seed-ish string for filter ids (optional; useId is enough). */
  className?: string;
};

/** Procedural washi fill + deckled edge via SVG turbulence / displacement. */
export function PaperSurface({ className }: PaperSurfaceProps) {
  const reactId = useId().replace(/:/g, "");
  const filterId = `paper-deckle-${reactId}`;
  const grainId = `paper-grain-${reactId}`;
  const washId = `paper-wash-${reactId}`;

  return (
    <div className={[styles.surface, className].filter(Boolean).join(" ")} aria-hidden>
      <svg className={styles.surfaceSvg} viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <filter
            id={filterId}
            x="-4%"
            y="-4%"
            width="108%"
            height="108%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035 0.05"
              numOctaves="3"
              seed="7"
              result="deckleNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="deckleNoise"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id={washId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              seed="3"
              result="wash"
            />
            <feColorMatrix
              in="wash"
              type="matrix"
              values="0 0 0 0 0.94
                      0 0 0 0 0.88
                      0 0 0 0 0.78
                      0 0 0 0.22 0"
            />
          </filter>

          <filter id={grainId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.9 1.1"
              numOctaves="2"
              seed="11"
              result="fibers"
            />
            <feColorMatrix
              in="fibers"
              type="matrix"
              values="0 0 0 0 0.35
                      0 0 0 0 0.28
                      0 0 0 0 0.2
                      0 0 0 0.14 0"
            />
          </filter>
        </defs>

        <rect
          x="2"
          y="2"
          width="396"
          height="296"
          rx="6"
          ry="6"
          fill={PAPER_COLORS.base}
          filter={`url(#${filterId})`}
        />
        <rect
          x="2"
          y="2"
          width="396"
          height="296"
          rx="6"
          ry="6"
          fill={PAPER_COLORS.baseWarm}
          opacity="0.55"
          filter={`url(#${filterId})`}
          style={{ mixBlendMode: "multiply" }}
        />
        <rect width="400" height="300" filter={`url(#${washId})`} opacity="0.7" />
        <rect width="400" height="300" filter={`url(#${grainId})`} opacity="0.55" />
      </svg>
      <div className={styles.stains} />
    </div>
  );
}

"use client";

import { forwardRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LanternPathGuides } from "./LanternPathGuides";
import styles from "./LanternPath.module.css";

export type LanternPathStageProps = {
  children: ReactNode;
  hud?: ReactNode;
  controls?: ReactNode;
  className?: string;
  /** Storybook/debug: show SVG path guide and stop labels. */
  showGuides?: boolean;
};

export const LanternPathStage = forwardRef<HTMLDivElement, LanternPathStageProps>(
  function LanternPathStage({ children, hud, controls, className, showGuides }, ref) {
    const t = useTranslations("Lantern.lanternPathStage");
    const viewportClass = [styles.flightPathViewport, className].filter(Boolean).join(" ");

    return (
      <div ref={ref} className={viewportClass}>
        {hud}
        <div className={styles.flightPathStage} aria-label={t("ariaLabel")}>
          <div className={styles.flightPathGuideBox}>
            {showGuides ? <LanternPathGuides /> : null}
            {children}
          </div>
        </div>
        {controls}
      </div>
    );
  },
);

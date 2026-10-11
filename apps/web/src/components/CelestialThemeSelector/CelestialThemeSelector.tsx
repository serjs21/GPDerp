"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { UIButton } from "@/components/ui";
import type { CelestialThemeClockHandle } from "@/components/CelestialThemeClock";
import { formatClockLabel } from "@/theme/celestialTime";
import type { GeoCoordinates } from "@/theme/celestialTheme";
import { BANGKOK_COORDINATES } from "@/theme/useCelestialScene";
import { CelestialSelectorPanel } from "./CelestialSelectorPanel";
import { useCelestialSelectorOpenTransition } from "./useCelestialSelectorOpenTransition";
import {
  useCelestialSelectorPanelMotion,
  type CelestialSelectorPanelPhase,
} from "./useCelestialSelectorPanelMotion";
import { triggerBodyBadge } from "./utils/selectorTriggerUtils";
import styles from "./CelestialThemeSelector.module.css";

const ALIEN_TRIGGER_SRC = "/theme-selector/alien-obduction.svg";

export type CelestialThemeSelectorProps = {
  slot: number;
  onChange: (slot: number) => void;
  onPreviewChange?: (slot: number) => void;
  coordinates?: GeoCoordinates;
  sceneVars?: Record<string, string>;
  className?: string;
  ariaLabel?: string;
};

export function CelestialThemeSelector({
  slot,
  onChange,
  onPreviewChange,
  coordinates = BANGKOK_COORDINATES,
  sceneVars,
  className,
  ariaLabel: ariaLabelProp,
}: CelestialThemeSelectorProps) {
  const t = useTranslations("CelestialThemeSelector");
  const ariaLabel = ariaLabelProp ?? t("ariaLabel");
  const [panelPhase, setPanelPhase] = useState<CelestialSelectorPanelPhase | null>(
    null,
  );
  const panelPhaseRef = useRef(panelPhase);
  panelPhaseRef.current = panelPhase;
  const clockRef = useRef<CelestialThemeClockHandle>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const panelChromeRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const timeLabel = formatClockLabel(slot);
  const sceneStyle = sceneVars as CSSProperties | undefined;
  const bodyBadge = triggerBodyBadge(slot);
  const isPanelMounted = panelPhase !== null;
  const isExpanded = panelPhase === "open";

  const requestClose = useCallback(() => {
    if (panelPhaseRef.current !== "open") return;
    setPanelPhase("closing");
    onChange(slot);
  }, [onChange, slot]);

  const handleCloseComplete = useCallback(() => {
    setPanelPhase(null);
  }, []);

  const {
    triggerRef,
    panelRef,
    panelPopRef,
    panelAnchor,
    updateAnchor,
    reduceMotion,
  } = useCelestialSelectorOpenTransition(isPanelMounted, requestClose);

  useCelestialSelectorPanelMotion({
    phase: panelPhase,
    reducedMotion: Boolean(reduceMotion),
    panelContentRef,
    panelChromeRef,
    ringRef,
    onCloseComplete: handleCloseComplete,
    onOpenLayout: updateAnchor,
  });

  const handlePreview = (nextSlot: number) => {
    onPreviewChange?.(nextSlot);
  };

  const handleCommit = (nextSlot: number) => {
    onChange(nextSlot);
  };

  const handleOpen = () => {
    setPanelPhase("open");
    requestAnimationFrame(() => {
      clockRef.current?.focus();
    });
  };

  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={sceneStyle}
    >
      <div className={styles.perspectiveRoot}>
        <div ref={triggerRef} className={styles.triggerAnchor}>
          <UIButton
            type="button"
            className={styles.trigger}
            aria-label={`${ariaLabel}, ${timeLabel}`}
            aria-expanded={isExpanded}
            aria-haspopup="dialog"
            onClick={() => (isExpanded ? requestClose() : handleOpen())}
          >
            <span className={styles.triggerFace} aria-hidden>
              <span className={styles.triggerArt}>
                <span className={styles.triggerSky} />
                {/* eslint-disable-next-line @next/next/no-img-element -- public SVG trigger asset */}
                <img
                  src={ALIEN_TRIGGER_SRC}
                  alt=""
                  className={styles.triggerAlien}
                  draggable={false}
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- public SVG body badge */}
                <img
                  src={bodyBadge.src}
                  alt=""
                  className={styles.triggerBodyBadge}
                  style={bodyBadge.style}
                  data-body={bodyBadge.label}
                  draggable={false}
                />
              </span>
            </span>
          </UIButton>
        </div>
        {isPanelMounted ? (
          <CelestialSelectorPanel
            panelRef={panelRef}
            panelPopRef={panelPopRef}
            panelChromeRef={panelChromeRef}
            panelContentRef={panelContentRef}
            ringRef={ringRef}
            clockRef={clockRef}
            anchor={panelAnchor}
            sceneStyle={sceneStyle}
            ariaLabel={ariaLabel}
            slot={slot}
            coordinates={coordinates}
            onPreview={handlePreview}
            onCommit={handleCommit}
          />
        ) : null}
      </div>
    </div>
  );
}

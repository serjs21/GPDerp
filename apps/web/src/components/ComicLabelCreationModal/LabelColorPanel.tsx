"use client";

import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { HexColorPicker } from "react-colorful";
import { useTranslations } from "next-intl";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import type { LabelColorPanelProps } from "./LabelColorPanel.types";
import styles from "./ComicLabelCreationModal.module.css";

const BRUSH_SRC = "/brush/brush-paint-repair.svg";
const FINE_DOG_SRC = "/thisisfine.svg";

/** Brush swatch tinted with the label color; opens a hex picker that closes on outside pointer down. */
export function LabelColorPanel({
  color,
  onColorChange,
  pickerOpen,
  onPickerOpenChange,
}: LabelColorPanelProps) {
  const t = useTranslations("ComicLabelCreationModal");
  const colorShellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = colorShellRef.current;
      if (!root) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      onPickerOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pickerOpen, onPickerOpenChange]);

  const openPicker = (event: MouseEvent) => {
    event.stopPropagation();
    onPickerOpenChange(true);
  };

  return (
    <div ref={colorShellRef} className={styles.colorShell}>
      <ComicPagePanel
        title={
          <span className={styles.colorTitle}>
            {t("color")}
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
            <img className={styles.fineDog} src={FINE_DOG_SRC} alt="" draggable={false} aria-hidden />
          </span>
        }
        background="solid"
        color="white"
        overflowVisible
        contentAlign="center"
        className={[styles.colorPanel, pickerOpen ? styles.colorPanelOpen : ""].filter(Boolean).join(" ")}
        ariaLabel={t("colorAriaLabel")}
        style={{ "--comic-panel-base": color } as CSSProperties}
      >
        {pickerOpen ? null : (
          <button
            type="button"
            className={styles.colorBody}
            onClick={openPicker}
            aria-label={t("openColorPicker")}
          >
            <span className={styles.brushPad}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
              <img className={styles.brush} src={BRUSH_SRC} alt="" draggable={false} />
            </span>
          </button>
        )}
      </ComicPagePanel>
      {pickerOpen ? (
        <div
          className={styles.pickerWrap}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <HexColorPicker color={color} onChange={onColorChange} />
        </div>
      ) : null}
    </div>
  );
}

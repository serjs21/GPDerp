"use client";

import { useLayoutEffect, useRef } from "react";
import { useHaikuGenerationFlow } from "./hooks/useHaikuGenerationFlow";
import { useHaikuGridColumnCount } from "./hooks/useHaikuGridColumnCount";
import { useSavedHaikuCount } from "./hooks/useSavedHaikuCount";
import { useStickyInputPlacement } from "./hooks/useStickyInputPlacement";
import { InitialHaikuGate } from "./InitialHaikuGate";
import {
  HAIKU_CARD_WIDTH_REM,
  HAIKU_GRID_COLUMN_GAP_REM,
  STICKY_INPUT_MIN_HEIGHT_REM,
} from "./constants";
import { HaikuGenerationStickyNoteInput } from "./HaikuGenerationStickyNoteInput/HaikuGenerationStickyNoteInput";
import { HaikuGenerationStickyNoteList } from "./HaikuGenerationStickyNoteList/HaikuGenerationStickyNoteList";
import styles from "./HaikuGenerationStickyNote.module.css";

export type StickyNoteInputAlignment = "bottom-center" | "bottom-start" | "bottom-end";

export type HaikuGenerationStickyNoteProps = {
  inputAlignment?: StickyNoteInputAlignment;
  cardWidthRem?: number;
  stickyInputMinHeightRem?: number;
};

function inputAlignClass(alignment: StickyNoteInputAlignment): string {
  if (alignment === "bottom-start") return styles.inputAlignStart;
  if (alignment === "bottom-end") return styles.inputAlignEnd;
  return styles.inputAlignCenter;
}

export function HaikuGenerationStickyNote({
  inputAlignment = "bottom-center",
  cardWidthRem = HAIKU_CARD_WIDTH_REM,
  stickyInputMinHeightRem = STICKY_INPUT_MIN_HEIGHT_REM,
}: HaikuGenerationStickyNoteProps = {}) {
  const {
    subject,
    setSubject,
    isLoading,
    generatingDraft,
    inputRef,
    onSubmit,
    contextHolder,
  } = useHaikuGenerationFlow();

  const { count, isListReady, isLoggedIn } = useSavedHaikuCount();
  const { columns } = useHaikuGridColumnCount(cardWidthRem);
  const { mode } = useStickyInputPlacement(stickyInputMinHeightRem);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const displayAreaRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const inputSection = inputSectionRef.current;
    if (!wrapper || !inputSection) return;

    const applyOffset = () => {
      if (mode !== "sticky-bottom") {
        wrapper.style.removeProperty("--sticky-input-offset");
        return;
      }
      wrapper.style.setProperty("--sticky-input-offset", `${inputSection.offsetHeight}px`);
    };

    applyOffset();

    const observer = new ResizeObserver(applyOffset);
    observer.observe(inputSection);

    return () => observer.disconnect();
  }, [mode]);

  const inputSectionClass = [
    styles.inputSection,
    mode === "sticky-bottom" ? styles.inputSectionStickyBottom : styles.inputSectionInline,
    inputAlignClass(inputAlignment),
  ]
    .filter(Boolean)
    .join(" ");

  const layoutStyle = {
    "--haiku-card-width": `${cardWidthRem}rem`,
    "--haiku-grid-gap": `${HAIKU_GRID_COLUMN_GAP_REM}rem`,
  } as React.CSSProperties;

  return (
    <div ref={wrapperRef} className={styles.wrapper} style={layoutStyle}>
      <div ref={displayAreaRef} className={styles.displayArea}>
        <HaikuGenerationStickyNoteList
          generatingDraft={generatingDraft}
          columns={columns}
          cardWidthRem={cardWidthRem}
          scrollRootRef={displayAreaRef}
        />
        <InitialHaikuGate
          key={isLoggedIn ? "logged-in" : "logged-out"}
          count={count}
          isListReady={isListReady}
        />
      </div>

      <div ref={inputSectionRef} className={inputSectionClass}>
        <HaikuGenerationStickyNoteInput
          subject={subject}
          onSubjectChange={setSubject}
          onSubmit={onSubmit}
          isLoading={isLoading}
          inputRef={inputRef}
        />
      </div>

      {contextHolder}
    </div>
  );
}

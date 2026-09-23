"use client";

import { useLayoutEffect, useEffect, useRef } from "react";
import { CreationModal } from "@/components/CreationModal";
import { SavedHaikusLanternPath } from "@/components/SavedHaikusLanternPath/SavedHaikusLanternPath";
import type { SVGPathHandle } from "@/components/SVGPath";
import { useHaikuDeleteController } from "@/hooks/useHaikuDeleteController";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { useCreationPathGate } from "./hooks/useCreationPathGate";
import { useHaikuGenerationFlow } from "./hooks/useHaikuGenerationFlow";
import { useSavedHaikuCount } from "./hooks/useSavedHaikuCount";
import { useStickyInputPlacement } from "./hooks/useStickyInputPlacement";
import { InitialHaikuGate } from "./InitialHaikuGate";
import {
  HAIKU_CARD_WIDTH_REM,
  STICKY_INPUT_MIN_HEIGHT_REM,
} from "./constants";
import { HaikuGenerationStickyNoteInput } from "./HaikuGenerationStickyNoteInput/HaikuGenerationStickyNoteInput";
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
  const pathRef = useRef<SVGPathHandle>(null);
  const bindHaikuSavedRef = useRef<(haiku: import("@/api/haikus").HaikuDto) => void>(() => {});
  const { invalidate } = useInfiniteHaikusQuery();
  const { onHaikuDeleted, onHaikuDeleteFailed, deleteFailedModal } = useHaikuDeleteController();

  const {
    subject,
    setSubject,
    isLoading,
    generatingDraft,
    inputRef,
    onSubmit,
  } = useHaikuGenerationFlow({
    onHaikuSaved: (haiku) => bindHaikuSavedRef.current(haiku),
  });

  const {
    creationOpen,
    creationHaiku,
    creationSessionKey,
    modalGeneratingDraft,
    onKeepScrolling,
    onGoToHaiku,
    onCreationHaikuDeleted,
    bindHaikuSaved,
  } = useCreationPathGate(generatingDraft, pathRef);

  useEffect(() => {
    bindHaikuSavedRef.current = bindHaikuSaved;
  }, [bindHaikuSaved]);

  const { count, isListReady, isLoggedIn } = useSavedHaikuCount();
  const { mode } = useStickyInputPlacement(stickyInputMinHeightRem);

  const wrapperRef = useRef<HTMLDivElement>(null);
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
  } as React.CSSProperties;

  return (
    <div ref={wrapperRef} className={styles.wrapper} style={layoutStyle}>
      <div className={styles.displayArea}>
        <SavedHaikusLanternPath
          ref={pathRef}
          generatingDraft={generatingDraft}
          creationChromeOpen={creationOpen}
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

      <CreationModal
        open={creationOpen}
        generatingDraft={modalGeneratingDraft}
        haiku={creationHaiku}
        isGenerating={Boolean(generatingDraft)}
        lanternSessionKey={creationSessionKey}
        showLanternActions={Boolean(creationHaiku)}
        showLantern={false}
        onHaikuDeleted={(haiku) => {
          onHaikuDeleted(haiku);
          onCreationHaikuDeleted();
        }}
        onHaikuDeleteFailed={onHaikuDeleteFailed}
        onHaikuChanged={invalidate}
        onKeepScrolling={onKeepScrolling}
        onGoToHaiku={onGoToHaiku}
      />

      {deleteFailedModal}
    </div>
  );
}

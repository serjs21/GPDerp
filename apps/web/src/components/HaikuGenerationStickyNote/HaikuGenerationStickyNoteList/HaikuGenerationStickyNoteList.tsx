"use client";

import { useRef, type RefObject } from "react";
import { SavedHaikusList } from "@/components/SavedHaikusList/SavedHaikusList";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { HAIKU_GRID_COLUMN_GAP_REM } from "../constants";
import { useScrollTopCardIntoView } from "../hooks/useScrollTopCardIntoView";
import { HaikuGenerationStickyNoteCardExit } from "../HaikuGenerationStickyNoteCardExit/HaikuGenerationStickyNoteCardExit";
import styles from "./HaikuGenerationStickyNoteList.module.css";

export type HaikuGenerationStickyNoteListProps = {
  generatingDraft?: GeneratingDraft | null;
  columns?: number;
  cardWidthRem?: number;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
};

export function HaikuGenerationStickyNoteList({
  generatingDraft,
  columns = 1,
  cardWidthRem = 28,
  scrollRootRef: externalScrollRootRef,
}: HaikuGenerationStickyNoteListProps) {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = externalScrollRootRef ?? internalScrollRef;

  useScrollTopCardIntoView(scrollRootRef, generatingDraft);

  const gridStyle = {
    "--haiku-grid-columns": columns,
    "--haiku-card-width": `${cardWidthRem}rem`,
    "--haiku-grid-gap": `${HAIKU_GRID_COLUMN_GAP_REM}rem`,
  } as React.CSSProperties;

  return (
    <div className={styles.scrollArea} style={gridStyle}>
      <SavedHaikusList
        embedded
        scrollRootRef={scrollRootRef}
        generatingDraft={generatingDraft}
        HaikuCardComponent={HaikuGenerationStickyNoteCardExit}
        showEmptyMessage={false}
        embeddedListClassName={styles.haikuGrid}
      />
    </div>
  );
}

export { styles as haikuGenerationStickyNoteListStyles };

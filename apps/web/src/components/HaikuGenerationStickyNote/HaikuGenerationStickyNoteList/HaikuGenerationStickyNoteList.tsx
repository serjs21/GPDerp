"use client";

import { useRef } from "react";
import { SavedHaikusList } from "@/components/SavedHaikusList/SavedHaikusList";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useScrollTopCardIntoView } from "../hooks/useScrollTopCardIntoView";
import { HaikuGenerationStickyNoteCard } from "../HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import styles from "./HaikuGenerationStickyNoteList.module.css";

export type HaikuGenerationStickyNoteListProps = {
  generatingDraft?: GeneratingDraft | null;
};

export function HaikuGenerationStickyNoteList({
  generatingDraft,
}: HaikuGenerationStickyNoteListProps) {
  const scrollRootRef = useRef<HTMLDivElement>(null);

  useScrollTopCardIntoView(scrollRootRef, generatingDraft);

  return (
    <div ref={scrollRootRef} className={styles.scrollArea}>
      <SavedHaikusList
        embedded
        scrollRootRef={scrollRootRef}
        generatingDraft={generatingDraft}
        HaikuCardComponent={HaikuGenerationStickyNoteCard}
        showEmptyMessage={false}
      />
    </div>
  );
}

export { styles as haikuGenerationStickyNoteListStyles };

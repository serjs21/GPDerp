"use client";

import type { RefObject } from "react";
import { SavedHaikusList } from "@/components/SavedHaikusList/SavedHaikusList";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { HaikuGenerationStickyNoteCard } from "../HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import styles from "./HaikuGenerationStickyNoteList.module.css";

export type HaikuGenerationStickyNoteListProps = {
  scrollRootRef: RefObject<HTMLDivElement | null>;
  generatingDraft?: GeneratingDraft | null;
};

export function HaikuGenerationStickyNoteList({
  scrollRootRef,
  generatingDraft,
}: HaikuGenerationStickyNoteListProps) {
  return (
    <SavedHaikusList
      embedded
      scrollRootRef={scrollRootRef}
      generatingDraft={generatingDraft}
      HaikuCardComponent={HaikuGenerationStickyNoteCard}
      showEmptyMessage={false}
    />
  );
}

export { styles as haikuGenerationStickyNoteListStyles };

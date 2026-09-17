"use client";

import { useEffect, useRef } from "react";
import { CreationModal } from "@/components/CreationModal";
import { SavedHaikusLanternPath } from "@/components/SavedHaikusLanternPath/SavedHaikusLanternPath";
import { PostSignInput } from "@/components/PostSignInput";
import type { SVGPathHandle } from "@/components/SVGPath";
import { useHaikuDeleteController } from "@/hooks/useHaikuDeleteController";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { useCreationPathGate } from "@/components/HaikuGenerationStickyNote/hooks/useCreationPathGate";
import { useHaikuGenerationFlow } from "@/components/HaikuGenerationStickyNote/hooks/useHaikuGenerationFlow";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import styles from "./HaikuDisplay.module.css";

export function HaikuDisplay() {
  const pathRef = useRef<SVGPathHandle>(null);
  const bindHaikuSavedRef = useRef<(haiku: import("@/api/haikus").HaikuDto) => void>(() => {});
  const { invalidate } = useInfiniteHaikusQuery();
  const { onHaikuDeleted, onHaikuDeleteFailed, deleteFailedModal } = useHaikuDeleteController();
  const { searchString, selectedLabelIds } = useHaikuFilters();

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.displayArea}>
        <SavedHaikusLanternPath
          ref={pathRef}
          generatingDraft={creationOpen ? null : generatingDraft}
          searchString={searchString}
          selectedLabelIds={selectedLabelIds}
        />
      </div>
      <div className={styles.inputSection}>
        <PostSignInput
          subject={subject}
          onSubjectChange={setSubject}
          onSubmit={onSubmit}
          isLoading={isLoading}
          inputRef={inputRef}
          sticky
        />
      </div>
      <CreationModal
        open={creationOpen}
        haiku={creationHaiku}
        generatingDraft={modalGeneratingDraft}
        lanternSessionKey={creationSessionKey}
        onKeepScrolling={onKeepScrolling}
        onGoToHaiku={onGoToHaiku}
        onHaikuDeleted={(haiku) => {
          onCreationHaikuDeleted();
          onHaikuDeleted(haiku);
        }}
        onHaikuDeleteFailed={onHaikuDeleteFailed}
        onHaikuChanged={() => invalidate()}
      />
      {deleteFailedModal}
    </div>
  );
}

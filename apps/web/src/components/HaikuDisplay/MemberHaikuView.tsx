"use client";

import { useEffect, useMemo, useRef } from "react";
import { preload } from "react-dom";
import { CreationModal } from "@/components/CreationModal";
import { SavedHaikusLanternPath } from "@/components/SavedHaikusLanternPath/SavedHaikusLanternPath";
import { PostSignInput } from "@/components/PostSignInput";
import type { SVGPathHandle } from "@/components/SVGPath";
import { useHaikuDeleteController } from "@/hooks/useHaikuDeleteController";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { useCreationPathGate } from "@/components/HaikuGenerationStickyNote/hooks/useCreationPathGate";
import { useHaikuGenerationFlow } from "@/components/HaikuGenerationStickyNote/hooks/useHaikuGenerationFlow";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import { orderSortToHaikuListSort } from "@/utils/haikuSort/haikuListSortUtils";
import { MAIN_MEMBER_LANTERN_ASSETS } from "@/consts/visualReadiness/criticalAssets";
import styles from "./HaikuDisplay.module.css";

/** Signed-in, verified Main: the saved-haiku lantern path, the subject input and the creation modal. */
export function MemberHaikuView() {
  // Lantern art is otherwise first requested when lanterns mount after the haiku query,
  // so lanternReveal would fade in frames whose base image is still downloading.
  for (const { src } of MAIN_MEMBER_LANTERN_ASSETS) preload(src, { as: "image" });
  const pathRef = useRef<SVGPathHandle>(null);
  const bindHaikuSavedRef = useRef<(haiku: import("@/api/haikus").HaikuDto) => void>(() => {});
  const { invalidate } = useInfiniteHaikusQuery();
  const { onHaikuDeleted, onHaikuDeleteFailed, deleteFailedModal } = useHaikuDeleteController();
  const { searchString, selectedLabelIds, excludedLabelIds, orderSort } = useHaikuFilters();
  const sort = useMemo(() => orderSortToHaikuListSort(orderSort), [orderSort]);

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
          generatingDraft={generatingDraft}
          creationChromeOpen={creationOpen}
          searchString={searchString}
          selectedLabelIds={selectedLabelIds}
          excludedLabelIds={excludedLabelIds}
          sort={sort}
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
        showLantern={false}
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

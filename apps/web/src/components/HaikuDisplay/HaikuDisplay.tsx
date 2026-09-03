"use client";

import { useEffect, useRef, useState } from "react";
import { CreationModal } from "@/components/CreationModal";
import { SavedHaikusLanternPath } from "@/components/SavedHaikusLanternPath/SavedHaikusLanternPath";
import { StoneInput } from "@/components/StoneInput";
import type { SVGPathHandle } from "@/components/SVGPath";
import { useHaikuDeleteController } from "@/hooks/useHaikuDeleteController";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { useCreationPathGate } from "@/components/HaikuGenerationStickyNote/hooks/useCreationPathGate";
import { useHaikuGenerationFlow } from "@/components/HaikuGenerationStickyNote/hooks/useHaikuGenerationFlow";
import { SearchInput } from "@/components/SearchInput";
import { LabelFilter } from "@/components/LabelFilter";
import styles from "./HaikuDisplay.module.css";

export function HaikuDisplay() {
  const pathRef = useRef<SVGPathHandle>(null);
  const bindHaikuSavedRef = useRef<(haiku: import("@/api/haikus").HaikuDto) => void>(() => {});
  const { invalidate } = useInfiniteHaikusQuery();
  const { onHaikuDeleted, onHaikuDeleteFailed, deleteFailedModal } = useHaikuDeleteController();

  const [searchString, setSearchString] = useState("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

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
      <div className={styles.filtersSection}>
        <SearchInput
          value={searchString}
          onChange={setSearchString}
        />
        <LabelFilter
          selectedLabelIds={selectedLabelIds}
          onChange={setSelectedLabelIds}
        />
      </div>
      <div className={styles.displayArea}>
        <SavedHaikusLanternPath
          ref={pathRef}
          generatingDraft={creationOpen ? null : generatingDraft}
          searchString={searchString}
          selectedLabelIds={selectedLabelIds}
        />
      </div>
      <div className={`${styles.inputSection} ${styles.inputSectionBottom}`}>
        <StoneInput
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

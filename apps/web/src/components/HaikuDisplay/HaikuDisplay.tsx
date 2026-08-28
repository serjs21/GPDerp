"use client";

import { useEffect, useRef } from "react";
import { CreationModal } from "@/components/CreationModal";
import { SavedHaikusLanternPath } from "@/components/SavedHaikusLanternPath/SavedHaikusLanternPath";
import { StoneInput } from "@/components/StoneInput";
import type { SVGPathHandle } from "@/components/SVGPath";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { useCreationPathGate } from "@/components/HaikuGenerationStickyNote/hooks/useCreationPathGate";
import { useHaikuGenerationFlow } from "@/components/HaikuGenerationStickyNote/hooks/useHaikuGenerationFlow";
import styles from "./HaikuDisplay.module.css";

export function HaikuDisplay() {
  const pathRef = useRef<SVGPathHandle>(null);
  const bindHaikuSavedRef = useRef<(haiku: import("@/api/haikus").HaikuDto) => void>(() => {});
  const { invalidate } = useInfiniteHaikusQuery();

  const {
    subject,
    setSubject,
    isLoading,
    generatingDraft,
    inputRef,
    onSubmit,
    contextHolder,
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
        onHaikuDeleted={() => {
          onCreationHaikuDeleted();
          invalidate();
        }}
        onHaikuChanged={invalidate}
        onKeepScrolling={onKeepScrolling}
        onGoToHaiku={onGoToHaiku}
      />
      {contextHolder}
    </div>
  );
}

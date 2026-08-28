"use client";

import { useRef } from "react";
import { CreationModal } from "@/components/CreationModal";
import { SavedHaikusLanternPath } from "@/components/SavedHaikusLanternPath/SavedHaikusLanternPath";
import { StoneInput } from "@/components/StoneInput";
import type { SVGPathHandle } from "@/components/SVGPath";
import { useCreationPathGate } from "@/components/HaikuGenerationStickyNote/hooks/useCreationPathGate";
import { useHaikuGenerationFlow } from "@/components/HaikuGenerationStickyNote/hooks/useHaikuGenerationFlow";
import styles from "./HaikuDisplay.module.css";

export function HaikuDisplay() {
  const {
    subject,
    setSubject,
    isLoading,
    generatingDraft,
    inputRef,
    onSubmit,
    contextHolder,
  } = useHaikuGenerationFlow();

  const pathRef = useRef<SVGPathHandle>(null);
  const { creationOpen, onKeepScrolling, onGoToHaiku } = useCreationPathGate(
    generatingDraft,
    pathRef,
  );

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
        generatingDraft={generatingDraft}
        onKeepScrolling={onKeepScrolling}
        onGoToHaiku={onGoToHaiku}
      />
      {contextHolder}
    </div>
  );
}

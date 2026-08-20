"use client";

import { SavedHaikusLanternPath } from "@/components/SavedHaikusLanternPath/SavedHaikusLanternPath";
import { StoneInput } from "@/components/StoneInput";
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.displayArea}>
        <SavedHaikusLanternPath generatingDraft={generatingDraft} />
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
      {contextHolder}
    </div>
  );
}

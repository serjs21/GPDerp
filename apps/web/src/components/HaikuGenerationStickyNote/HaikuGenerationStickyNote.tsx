"use client";

import { useHaikuGenerationFlow } from "./hooks/useHaikuGenerationFlow";
import { useSavedHaikuCount } from "./hooks/useSavedHaikuCount";
import { InitialHaikuGate } from "./InitialHaikuGate";
import { HaikuGenerationStickyNoteInput } from "./HaikuGenerationStickyNoteInput/HaikuGenerationStickyNoteInput";
import { HaikuGenerationStickyNoteList } from "./HaikuGenerationStickyNoteList/HaikuGenerationStickyNoteList";
import styles from "./HaikuGenerationStickyNote.module.css";

export function HaikuGenerationStickyNote() {
  const {
    subject,
    setSubject,
    isLoading,
    generatingDraft,
    inputRef,
    onSubmit,
    contextHolder,
  } = useHaikuGenerationFlow();

  const { count, isListReady, isLoggedIn } = useSavedHaikuCount();

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputSection}>
        <HaikuGenerationStickyNoteInput
          subject={subject}
          onSubjectChange={setSubject}
          onSubmit={onSubmit}
          isLoading={isLoading}
          inputRef={inputRef}
        />
      </div>

      <div className={styles.displayArea}>
        <HaikuGenerationStickyNoteList generatingDraft={generatingDraft} />
        <InitialHaikuGate
          key={isLoggedIn ? "logged-in" : "logged-out"}
          count={count}
          isListReady={isListReady}
        />
      </div>

      {contextHolder}
    </div>
  );
}

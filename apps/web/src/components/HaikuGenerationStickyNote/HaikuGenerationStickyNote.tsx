"use client";

import { useState } from "react";
import { useHaikuGenerationFlow } from "./hooks/useHaikuGenerationFlow";
import { HaikuGenerationStickyNoteInitial } from "./HaikuGenerationStickyNoteInitial/HaikuGenerationStickyNoteInitial";
import { HaikuGenerationStickyNoteInput } from "./HaikuGenerationStickyNoteInput/HaikuGenerationStickyNoteInput";
import { HaikuGenerationStickyNoteList } from "./HaikuGenerationStickyNoteList/HaikuGenerationStickyNoteList";
import styles from "./HaikuGenerationStickyNote.module.css";

export function HaikuGenerationStickyNote() {
  const {
    subject,
    setSubject,
    isLoading,
    generatingDraft,
    hasUserGenerated,
    streamScrollRef,
    endOfContentRef,
    inputRef,
    onSubmit,
    contextHolder,
  } = useHaikuGenerationFlow();

  const [initialDismissed, setInitialDismissed] = useState(false);
  const showInitial = !initialDismissed;

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

      <div ref={streamScrollRef} className={styles.scrollArea}>
        {showInitial ? (
          <HaikuGenerationStickyNoteInitial
            washingOut={hasUserGenerated}
            onWashedOut={() => setInitialDismissed(true)}
          />
        ) : null}
        <HaikuGenerationStickyNoteList
          scrollRootRef={streamScrollRef}
          generatingDraft={generatingDraft}
        />
        <div ref={endOfContentRef} aria-hidden="true" />
      </div>

      {contextHolder}
    </div>
  );
}

"use client";

import { PaperPlaneExit } from "@/components/animations/PaperPlaneExit/PaperPlaneExit";
import { TextTyping } from "@/components/TextTyping/TextTyping";
import { INITIAL_HAIKU_TEXT } from "../constants";
import { HaikuGenerationStickyNoteShell } from "../HaikuGenerationStickyNoteShell/HaikuGenerationStickyNoteShell";
import styles from "./HaikuGenerationStickyNoteInitial.module.css";

export type HaikuGenerationStickyNoteInitialProps = {
  washingOut?: boolean;
  onWashedOut?: () => void;
  text?: string;
};

export function HaikuGenerationStickyNoteInitial({
  washingOut = false,
  onWashedOut,
  text = INITIAL_HAIKU_TEXT,
}: HaikuGenerationStickyNoteInitialProps) {
  return (
    <PaperPlaneExit active={washingOut} onComplete={onWashedOut}>
      <div className={styles.root}>
        <HaikuGenerationStickyNoteShell body={<TextTyping text={text} />} rotate={-1.2} />
      </div>
    </PaperPlaneExit>
  );
}

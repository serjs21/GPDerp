"use client";

import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { deleteHaiku } from "@/api/haikus";
import { PaperPlaneExit } from "@/components/animations/PaperPlaneExit/PaperPlaneExit";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { comicToast } from "@/components/ComicToast";
import { HaikuGenerationStickyNoteCard } from "../HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";

export function HaikuGenerationStickyNoteCardExit(props: HaikuContainerProps) {
  const [exiting, setExiting] = useState(false);
  const exitResolveRef = useRef<(() => void) | null>(null);

  const handleExitComplete = useCallback(() => {
    exitResolveRef.current?.();
    exitResolveRef.current = null;
  }, []);

  if ("generatingDraft" in props && props.generatingDraft) {
    return <HaikuGenerationStickyNoteCard {...props} />;
  }

  const { haiku, onDeleted, onChanged } = props;

  const handleDelete = async () => {
    const animationDone = new Promise<void>((resolve) => {
      exitResolveRef.current = resolve;
    });
    setExiting(true);
    await animationDone;

    try {
      await deleteHaiku(haiku.id);
      comicToast.success("Haiku deleted");
      onDeleted?.();
    } catch (e) {
      setExiting(false);
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        comicToast.error("You are not allowed to delete this haiku.");
      } else {
        comicToast.error("Could not delete haiku.");
      }
      throw e;
    }
  };

  return (
    <PaperPlaneExit active={exiting} onComplete={handleExitComplete}>
      <HaikuGenerationStickyNoteCard
        haiku={haiku}
        onDeleted={onDeleted}
        onChanged={onChanged}
        onDelete={handleDelete}
      />
    </PaperPlaneExit>
  );
}

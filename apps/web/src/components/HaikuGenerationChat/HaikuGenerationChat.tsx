"use client";

import { useLayoutEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SendHaikuAgentRequest } from "./SendHaikuAgentRequest";
import {
  HAIKU_LIST_PAGE_SIZE,
  prependHaikuToInfiniteCache,
} from "@/api/haikus";
import { SavedHaikusList } from "@/components/SavedHaikusList/SavedHaikusList";
import { useHaikuSocket } from "@/hooks/useHaikuSocket";
import styles from "./style.module.css";

const THRESHOLD = 80;

export const HaikuGenerationChat = () => {
  const queryClient = useQueryClient();
  const streamScrollRef = useRef<HTMLDivElement | null>(null);

  const { generatingDraft } = useHaikuSocket({
    onHaikuSaved: (haiku) => {
      prependHaikuToInfiniteCache(queryClient, HAIKU_LIST_PAGE_SIZE, haiku);
    },
  });

  useLayoutEffect(() => {
    const el = streamScrollRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD;

    if (isNearBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [generatingDraft?.content, generatingDraft?.requestId]);

  return (
    <div className={styles.chatWrapper}>
      <SendHaikuAgentRequest />
      <div ref={streamScrollRef} className={styles.chatLogContainer}>
        <SavedHaikusList
          embedded
          scrollRootRef={streamScrollRef}
          generatingDraft={generatingDraft}
        />
      </div>
    </div>
  );
};

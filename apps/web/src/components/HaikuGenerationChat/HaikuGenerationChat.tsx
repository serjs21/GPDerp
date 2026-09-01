"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { comicToast } from "@/components/ComicToast";
import {
  HAIKU_LIST_PAGE_SIZE,
  prependHaikuToInfiniteCache,
} from "@/api/haikus";
import { runHaikuAgent } from "@/api/agents";
import { SavedHaikusList } from "@/components/SavedHaikusList/SavedHaikusList";
import { useHaikuSocket } from "@/hooks/useHaikuSocket";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { Kasagi, Nuki, Pillars, Shimaki } from "@/components/Dividers";
import { WritingLoader } from "@/components/Loaders";
import styles from "./style.module.css";

export const HaikuGenerationChat = () => {
  const queryClient = useQueryClient();
  const streamScrollRef = useRef<HTMLDivElement | null>(null);
  const endOfContentRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const { requestAuthentication } = useAuthenticationVerification();

  const { generatingDraft } = useHaikuSocket({
    onHaikuSaved: (haiku) => {
      prependHaikuToInfiniteCache(queryClient, HAIKU_LIST_PAGE_SIZE, haiku);
    },
  });

  useEndOfContentScroll(
    streamScrollRef,
    endOfContentRef,
    () => {
      const el = streamScrollRef.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    },
    { enabled: Boolean(generatingDraft) },
  );

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const onError = () => {
    comicToast.error("Don't panic, but something went wrong", {
      description:
        "Our slaves are working hard on fixing this issue. We will dispatch someone to hit them harder soon.\nPlease try again later.",
      duration: 3000,
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    if (!requestAuthentication()) {
      return;
    }

    try {
      setIsLoading(true);
      await runHaikuAgent(subject);
      setSubject("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send haiku agent request:", error);
      onError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatWrapper}>
      <form onSubmit={onSubmit} autoComplete="off" className={styles.shrine}>
        <Kasagi />
        <Shimaki />
        <Nuki />
        <Pillars>
          <input
            ref={inputRef}
            className={styles.shrineInput}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            placeholder="題 Subejct"
          />
          <button
            type="submit"
            className={styles.shrineButton}
            disabled={isLoading || !subject.trim().length}
          >
            {isLoading ? <WritingLoader variant="pen" /> : "詠む Compose"}
          </button>
        </Pillars>
        <Nuki />
      </form>
      <div ref={streamScrollRef} className={styles.chatLogContainer}>
        <SavedHaikusList
          embedded
          scrollRootRef={streamScrollRef}
          generatingDraft={generatingDraft}
        />
        <div ref={endOfContentRef} aria-hidden="true" />
      </div>
    </div>
  );
};

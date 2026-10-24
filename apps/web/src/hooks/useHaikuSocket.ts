"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { haikuQueryKeys, type HaikuDto } from "@/api/haikus";
import { HAIKU_TYPING_PIECE_SIZES } from "@/consts/haiku/haikuTypingConsts";
import { haikuTitleTypingDurationMs, haikuTypingCharDelayMs } from "@/utils/haikuTyping/haikuTypingUtils";
import { createTypingPacer, type TypingPacer } from "@/utils/haikuTyping/typingPacer";
import { getSharedSocket } from "@/utils/webSocket/sharedSocketManager";
import { formatChatTime } from "../utils/date";
import { formatHaikuTitleText } from "../utils/strings";
import { useWebSocket } from "./useWebSocket";

export type GeneratingDraft = {
  requestId: string;
  subject: string;
  content: string;
  createdAtLabel: string;
};

type DeltaPayload = {
  id: string;
  data: { delta?: string; subject: string };
  kind?: "delta";
};

type SavedPayload = {
  id: string;
  kind: "saved";
  data: { haiku: HaikuDto; subject: string };
};

type CompletePayload = {
  id: string;
  kind: "complete";
  data: { subject: string };
};

/** Sent before the model's first token so the lantern (with its title) shows immediately. */
type StartPayload = {
  id: string;
  kind: "start";
  data: { subject: string };
};

type WsHaikuMessage = StartPayload | DeltaPayload | SavedPayload | CompletePayload;

/** Subject with the saved-title transform (capitalization), so the generating title matches the saved one. */
const readSubject = (data: Record<string, unknown>): string =>
  typeof data.subject === "string" ? formatHaikuTitleText(data.subject) : "";

function parseMessage(raw: string): WsHaikuMessage | null {
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, unknown>;
    const id = parsed.id;
    if (typeof id !== "string") return null;

    const kind = (parsed.kind as string | undefined) ?? "delta";
    const data = parsed.data as Record<string, unknown> | undefined;
    if (!data || typeof data !== "object") return null;

    if (kind === "saved") {
      const haiku = data.haiku as HaikuDto | undefined;
      if (!haiku || typeof haiku.id !== "string") return null;
      const subject = readSubject(data);
      return { id, kind: "saved", data: { haiku, subject } };
    }

    if (kind === "complete" || kind === "start") {
      const subject = readSubject(data);
      return { id, kind, data: { subject } };
    }

    const subject = readSubject(data);
    const delta = typeof data.delta === "string" ? data.delta : "";
    return {
      id,
      kind: "delta",
      data: { delta, subject },
    };
  } catch {
    return null;
  }
}

export type UseHaikuSocketOptions = {
  onHaikuSaved?: (haiku: HaikuDto) => void;
};

type ActivePacer = { requestId: string; pacer: TypingPacer };

const emptyDraft = (requestId: string, subject: string): GeneratingDraft => ({
  requestId,
  subject,
  content: "",
  createdAtLabel: formatChatTime(new Date()),
});

export const useHaikuSocket = (options?: UseHaikuSocketOptions) => {
  const { onHaikuSaved } = options ?? {};
  const queryClient = useQueryClient();
  const [generatingDraft, setGeneratingDraft] = useState<GeneratingDraft | null>(null);
  const draftRef = useRef<GeneratingDraft | null>(null);
  useEffect(() => {
    draftRef.current = generatingDraft;
  }, [generatingDraft]);
  // Requests whose stream was cut by a reconnect: their remaining messages are ignored and REST supplies the result.
  const abandonedRequestsRef = useRef(new Set<string>());
  // Streamed text is revealed through a pacer at the mock typing speed, whatever the chunk size.
  const pacerRef = useRef<ActivePacer | null>(null);

  const pacerFor = useCallback(
    (requestId: string): TypingPacer => {
      if (pacerRef.current?.requestId === requestId) return pacerRef.current.pacer;
      pacerRef.current?.pacer.dispose();
      const pacer = createTypingPacer({
        onReveal: (piece) =>
          setGeneratingDraft((prev) =>
            prev?.requestId === requestId ? { ...prev, content: prev.content + piece } : prev,
          ),
        charDelayMs: () => haikuTypingCharDelayMs(),
        pieceSizes: HAIKU_TYPING_PIECE_SIZES,
      });
      pacerRef.current = { requestId, pacer };
      return pacer;
    },
    [],
  );

  /** Runs `action` once the request's streamed text has finished typing (immediately if nothing is pacing). */
  const afterTyping = useCallback(
    (requestId: string, action: () => void) => {
      const active = pacerRef.current;
      if (active?.requestId !== requestId) {
        action();
        return;
      }
      active.pacer.whenDrained(() => {
        if (pacerRef.current === active) pacerRef.current = null;
        active.pacer.dispose();
        action();
      });
    },
    [],
  );

  useEffect(() => {
    const ref = pacerRef;
    return () => ref.current?.pacer.dispose();
  }, []);

  const logMessage = useCallback(
    (event: MessageEvent) => {
      const msg = parseMessage(String(event.data ?? ""));
      if (!msg || abandonedRequestsRef.current.has(msg.id)) return;

      if (msg.kind === "saved") {
        afterTyping(msg.id, () => {
          // One paint: drop draft, snap creation→0, prepend haiku (avoids stop-19 flash at focus -1).
          flushSync(() => {
            setGeneratingDraft((d) => (d?.requestId === msg.id ? null : d));
            onHaikuSaved?.(msg.data.haiku);
          });
        });
        return;
      }

      if (msg.kind === "complete") {
        afterTyping(msg.id, () => setGeneratingDraft((d) => (d?.requestId === msg.id ? null : d)));
        return;
      }

      if (msg.kind === "start") {
        setGeneratingDraft((prev) => (prev?.requestId === msg.id ? prev : emptyDraft(msg.id, msg.data.subject)));
        // Body starts typing once the title has typed in.
        pacerFor(msg.id).holdFor(haikuTitleTypingDurationMs(msg.data.subject));
        return;
      }

      const { id, data } = msg;
      setGeneratingDraft((prev) =>
        !prev || prev.requestId !== id
          ? emptyDraft(id, data.subject)
          : { ...prev, subject: data.subject || prev.subject },
      );
      pacerFor(id).push(data.delta ?? "");
    },
    [afterTyping, onHaikuSaved, pacerFor],
  );

  const { connected, send } = useWebSocket({ onMessage: logMessage });

  const resetGenerating = useCallback(() => {
    pacerRef.current?.pacer.dispose();
    pacerRef.current = null;
    setGeneratingDraft(null);
  }, []);

  useEffect(
    () =>
      getSharedSocket().onReconnected(() => {
        const draft = draftRef.current;
        if (!draft) return;
        abandonedRequestsRef.current.add(draft.requestId);
        resetGenerating();
        void queryClient.invalidateQueries({ queryKey: haikuQueryKeys.all });
      }),
    [queryClient, resetGenerating],
  );

  return {
    connected,
    send,
    generatingDraft,
    resetGenerating,
  };
};

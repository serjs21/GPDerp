"use client";

import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import type { HaikuDto } from "@/api/haikus";
import { formatChatTime } from "../utils/date";
import { useWebSocket } from "./useWebSocket";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

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

type WsHaikuMessage = DeltaPayload | SavedPayload | CompletePayload;

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
      const subject = typeof data.subject === "string" ? data.subject : "";
      return { id, kind: "saved", data: { haiku, subject } };
    }

    if (kind === "complete") {
      const subject = typeof data.subject === "string" ? data.subject : "";
      return { id, kind: "complete", data: { subject } };
    }

    const subject = typeof data.subject === "string" ? data.subject : "";
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

export const useHaikuSocket = (options?: UseHaikuSocketOptions) => {
  const { onHaikuSaved } = options ?? {};
  const [generatingDraft, setGeneratingDraft] = useState<GeneratingDraft | null>(null);

  const logMessage = useCallback(
    (event: MessageEvent) => {
      const msg = parseMessage(String(event.data ?? ""));
      if (!msg) return;

      if (msg.kind === "saved") {
        // One paint: drop draft, snap creation→0, prepend haiku (avoids stop-19 flash at focus -1).
        flushSync(() => {
          setGeneratingDraft((d) => (d?.requestId === msg.id ? null : d));
          onHaikuSaved?.(msg.data.haiku);
        });
        return;
      }

      if (msg.kind === "complete") {
        setGeneratingDraft((d) => (d?.requestId === msg.id ? null : d));
        return;
      }

      const { id, data } = msg;
      const delta = data.delta ?? "";

      setGeneratingDraft((prev) => {
        if (!prev || prev.requestId !== id) {
          return {
            requestId: id,
            subject: data.subject,
            content: delta,
            createdAtLabel: formatChatTime(new Date()),
          };
        }
        return {
          ...prev,
          content: prev.content + delta,
          subject: data.subject || prev.subject,
        };
      });
    },
    [onHaikuSaved],
  );

  const { connected, send } = useWebSocket({
    url: SOCKET_URL,
    enabled: true,
    reconnect: true,
    onMessage: logMessage,
  });

  const resetGenerating = useCallback(() => {
    setGeneratingDraft(null);
  }, []);

  return {
    connected,
    send,
    generatingDraft,
    resetGenerating,
  };
};

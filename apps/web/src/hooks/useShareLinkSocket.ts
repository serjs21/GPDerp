"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { useWebSocket } from "./useWebSocket";
import {
  patchShareLinksCache,
  removeShareLinkFromCache,
  SHARE_LINKS_QUERY_KEY,
  type ShareLinksInfiniteData,
} from "./shareLinksCache";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

function parseShareLinkSocketMessage(
  raw: string,
):
  | { kind: "share_link"; data: ShareLinkListItem }
  | { kind: "share_link_deleted"; data: { id: string } }
  | null {
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, unknown>;
    if (parsed.kind === "share_link_deleted") {
      const data = parsed.data as { id?: unknown } | undefined;
      if (!data || typeof data.id !== "string") return null;
      return { kind: "share_link_deleted", data: { id: data.id } };
    }
    if (parsed.kind !== "share_link") return null;
    const data = parsed.data as ShareLinkListItem | undefined;
    if (!data || typeof data.id !== "string") return null;
    return { kind: "share_link", data };
  } catch {
    return null;
  }
}

export type UseShareLinkSocketOptions = {
  /** Extra handler after the share-links query cache is patched (e.g. modal local state). */
  onShareLink?: (link: ShareLinkListItem) => void;
  onShareLinkDeleted?: (id: string) => void;
};

export function useShareLinkSocket(
  enabled: boolean,
  { onShareLink, onShareLinkDeleted }: UseShareLinkSocketOptions = {},
) {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuthenticationState();
  const active = Boolean(enabled && isLoggedIn);

  const onMessage = useCallback(
    (event: MessageEvent) => {
      const msg = parseShareLinkSocketMessage(String(event.data ?? ""));
      if (!msg) return;

      if (msg.kind === "share_link_deleted") {
        queryClient.setQueriesData<ShareLinksInfiniteData>(
          { queryKey: SHARE_LINKS_QUERY_KEY },
          (old) => removeShareLinkFromCache(old, msg.data.id),
        );
        onShareLinkDeleted?.(msg.data.id);
        return;
      }

      queryClient.setQueriesData<ShareLinksInfiniteData>(
        { queryKey: SHARE_LINKS_QUERY_KEY },
        (old) => patchShareLinksCache(old, msg.data),
      );
      onShareLink?.(msg.data);
    },
    [onShareLink, onShareLinkDeleted, queryClient],
  );

  useWebSocket({
    url: SOCKET_URL,
    enabled: active,
    reconnect: true,
    onOpen: (ws) => {
      ws.send(JSON.stringify({ type: "subscribe", channel: "share-links" }));
    },
    onMessage,
  });
}

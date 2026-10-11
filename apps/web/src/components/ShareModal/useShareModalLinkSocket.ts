"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { useShareLinkSocket } from "@/hooks/useShareLinkSocket";

/** Keeps the modal's share link in sync with socket updates / deletes while open. */
export function useShareModalLinkSocket(
  open: boolean,
  haikuId: string,
  setShareLink: Dispatch<SetStateAction<ShareLinkListItem | null>>,
) {
  const onShareLinkSocketUpdate = useCallback(
    (updated: ShareLinkListItem) => {
      setShareLink((prev) => {
        if (updated.sharedHaikuId === haikuId) return { ...prev, ...updated };
        if (prev?.id === updated.id) return { ...prev, ...updated };
        return prev;
      });
    },
    [haikuId, setShareLink],
  );

  const onShareLinkSocketDeleted = useCallback(
    (id: string) => {
      setShareLink((prev) => (prev?.id === id ? null : prev));
    },
    [setShareLink],
  );

  useShareLinkSocket(open, {
    onShareLink: onShareLinkSocketUpdate,
    onShareLinkDeleted: onShareLinkSocketDeleted,
  });
}

"use client";

import { useMemo } from "react";
import { comicToast, type ComicToastOptions } from "./comicToast";
import { useComicToastContext } from "./ComicToastProvider";
import type { ComicToastPushInput } from "./comicToastState";

export function useComicToast() {
  const { push, dismiss } = useComicToastContext();

  return useMemo(
    () => ({
      push: (toast: ComicToastPushInput) => push(toast),
      dismiss,
      info: (content: ComicToastPushInput["content"], options?: ComicToastOptions) =>
        push({ tone: "info", content, ...options }),
      success: (content: ComicToastPushInput["content"], options?: ComicToastOptions) =>
        push({ tone: "success", content, ...options }),
      warning: (content: ComicToastPushInput["content"], options?: ComicToastOptions) =>
        push({ tone: "warning", content, ...options }),
      error: (content: ComicToastPushInput["content"], options?: ComicToastOptions) =>
        push({ tone: "error", content, ...options }),
      /** Same imperative helpers as `comicToast` when provider is mounted. */
      global: comicToast,
    }),
    [dismiss, push],
  );
}

import type { ReactNode } from "react";
import type { ComicToastTone } from "./comicToastPresets";
import type { ComicToastPushInput } from "./comicToastState";

export type ComicToastOptions = {
  duration?: number;
  description?: ReactNode;
};

type ComicToastDispatcher = ((toast: ComicToastPushInput) => void) | null;

let dispatcher: ComicToastDispatcher = null;

export function registerComicToastDispatcher(next: ComicToastDispatcher): void {
  dispatcher = next;
}

function push(tone: ComicToastTone, content: ReactNode, options?: ComicToastOptions): void {
  dispatcher?.({
    tone,
    content,
    description: options?.description,
    duration: options?.duration,
  });
}

/**
 * Imperative comic-bubble toasts. Requires `ComicToastProvider` in the app shell.
 */
export const comicToast = {
  show(content: ReactNode, options?: ComicToastOptions & { tone?: ComicToastTone }): void {
    push(options?.tone ?? "info", content, options);
  },
  info(content: ReactNode, options?: ComicToastOptions): void {
    push("info", content, options);
  },
  success(content: ReactNode, options?: ComicToastOptions): void {
    push("success", content, options);
  },
  warning(content: ReactNode, options?: ComicToastOptions): void {
    push("warning", content, options);
  },
  error(content: ReactNode, options?: ComicToastOptions): void {
    push("error", content, options);
  },
};

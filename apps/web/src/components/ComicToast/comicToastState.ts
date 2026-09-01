import type { ReactNode } from "react";
import {
  COMIC_TOAST_DEFAULT_DURATION_MS,
  type ComicToastTone,
} from "./comicToastPresets";

export type ComicToastRecord = {
  id: string;
  tone: ComicToastTone;
  content: ReactNode;
  description?: ReactNode;
  duration: number;
  exiting: boolean;
};

export type ComicToastPushInput = {
  tone: ComicToastTone;
  content: ReactNode;
  description?: ReactNode;
  duration?: number;
};

export type ComicToastState = {
  toasts: ComicToastRecord[];
};

export type ComicToastAction =
  | { type: "push"; toast: ComicToastPushInput }
  | { type: "dismiss"; id: string }
  | { type: "remove"; id: string };

let toastIdCounter = 0;

function nextToastId(): string {
  toastIdCounter += 1;
  return `comic-toast-${toastIdCounter}`;
}

export function comicToastReducer(state: ComicToastState, action: ComicToastAction): ComicToastState {
  switch (action.type) {
    case "push": {
      const record: ComicToastRecord = {
        id: nextToastId(),
        tone: action.toast.tone,
        content: action.toast.content,
        description: action.toast.description,
        duration: action.toast.duration ?? COMIC_TOAST_DEFAULT_DURATION_MS,
        exiting: false,
      };
      return { toasts: [...state.toasts, record] };
    }
    case "dismiss":
      return {
        toasts: state.toasts.map((toast) =>
          toast.id === action.id ? { ...toast, exiting: true } : toast,
        ),
      };
    case "remove":
      return { toasts: state.toasts.filter((toast) => toast.id !== action.id) };
    default:
      return state;
  }
}

export const initialComicToastState: ComicToastState = { toasts: [] };

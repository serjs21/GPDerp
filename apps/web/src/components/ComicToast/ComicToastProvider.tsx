"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { ComicToastViewport } from "./ComicToastViewport";
import {
  comicToastReducer,
  initialComicToastState,
  type ComicToastPushInput,
} from "./comicToastState";
import { registerComicToastDispatcher } from "./comicToast";

type ComicToastContextValue = {
  push: (toast: ComicToastPushInput) => void;
  dismiss: (id: string) => void;
};

const ComicToastContext = createContext<ComicToastContextValue | null>(null);

export type ComicToastProviderProps = {
  children: ReactNode;
};

export function ComicToastProvider({ children }: ComicToastProviderProps) {
  const [state, dispatch] = useReducer(comicToastReducer, initialComicToastState);

  const push = useCallback((toast: ComicToastPushInput) => {
    dispatch({ type: "push", toast });
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: "dismiss", id });
  }, []);

  const remove = useCallback((id: string) => {
    dispatch({ type: "remove", id });
  }, []);

  useEffect(() => {
    registerComicToastDispatcher(push);
    return () => registerComicToastDispatcher(null);
  }, [push]);

  const contextValue = useMemo(() => ({ push, dismiss }), [dismiss, push]);

  return (
    <ComicToastContext.Provider value={contextValue}>
      {children}
      <ComicToastViewport toasts={state.toasts} onDismiss={dismiss} onRemove={remove} />
    </ComicToastContext.Provider>
  );
}

export function useComicToastContext(): ComicToastContextValue {
  const context = useContext(ComicToastContext);
  if (!context) {
    throw new Error("useComicToast must be used within ComicToastProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import type { Paddle } from "@paddle/paddle-js";
import { hasPaddleTransactionLink } from "@/utils/paddle/paddleTransactionLink";
import { readPaddleClientEnv } from "./paddleClientEnv";
import { PADDLE_CHECKOUT_LOADED_EVENT } from "./openPaddleCheckoutWithFallback";
import {
  initPaddleClient,
  PADDLE_CHECKOUT_COMPLETED_EVENT,
  type PaddleCheckoutCompletedDetail,
} from "./initPaddleClient";

export { PADDLE_CHECKOUT_COMPLETED_EVENT, PADDLE_CHECKOUT_LOADED_EVENT };
export type { PaddleCheckoutCompletedDetail };

type PaddleContextValue = {
  configured: boolean;
  /**
   * Downloads and initializes Paddle on first call (purchase intent), then reuses it.
   * Resolves `null` when Paddle is not configured or failed to load; a later call retries.
   */
  ensurePaddle: () => Promise<Paddle | null>;
};

const PaddleContext = createContext<PaddleContextValue | undefined>(undefined);

export const PaddleProvider = ({ children }: { children: ReactNode }) => {
  const { token, environment, configured } = readPaddleClientEnv();
  const paddleRef = useRef<Promise<Paddle | null> | null>(null);

  const ensurePaddle = () => {
    if (!configured || !token) return Promise.resolve(null);
    paddleRef.current ??= initPaddleClient(token, environment).then(
      (instance) => {
        if (!instance) paddleRef.current = null;
        return instance;
      },
      () => {
        paddleRef.current = null;
        return null;
      },
    );
    return paddleRef.current;
  };

  // Paddle's default payment link lands here with ?_ptxn=…; Paddle.js opens that checkout once initialized.
  const ensurePaddleRef = useRef(ensurePaddle);
  useEffect(() => {
    if (hasPaddleTransactionLink(window.location.search)) void ensurePaddleRef.current();
  }, []);

  return (
    <PaddleContext.Provider value={{ configured, ensurePaddle }}>{children}</PaddleContext.Provider>
  );
};

export const usePaddle = (): PaddleContextValue => {
  const value = useContext(PaddleContext);
  if (!value) {
    throw new Error("usePaddle must be used within PaddleProvider");
  }
  return value;
};

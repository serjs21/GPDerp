"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  CheckoutEventNames,
  initializePaddle,
  type Paddle,
  type PaddleEventData,
} from "@paddle/paddle-js";
import { readPaddleClientEnv } from "./paddleClientEnv";
import { loadPaddleSdk } from "./loadPaddleSdk";
import { PADDLE_CHECKOUT_LOADED_EVENT } from "./openPaddleCheckoutWithFallback";

export const PADDLE_CHECKOUT_COMPLETED_EVENT = "paddle:checkout-completed";
export { PADDLE_CHECKOUT_LOADED_EVENT };

export type PaddleCheckoutCompletedDetail = {
  transactionId: string;
};

type PaddleContextValue = {
  paddle: Paddle | null;
  ready: boolean;
  initializing: boolean;
  configured: boolean;
};

const PaddleContext = createContext<PaddleContextValue | undefined>(undefined);

const readTransactionId = (event: PaddleEventData): string | null => {
  const id = event.data?.transaction_id ?? event.data?.id;
  return typeof id === "string" && id.startsWith("txn_") ? id : null;
};

export const PaddleProvider = ({ children }: { children: ReactNode }) => {
  const { token, environment, configured } = readPaddleClientEnv();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [initializing, setInitializing] = useState(configured);

  useEffect(() => {
    if (!configured || !token) return;

    let cancelled = false;
    void loadPaddleSdk()
      .then(() =>
        initializePaddle({
          token,
          environment,
          eventCallback: (event) => {
            if (event.name === CheckoutEventNames.CHECKOUT_LOADED) {
              window.dispatchEvent(new CustomEvent(PADDLE_CHECKOUT_LOADED_EVENT));
            }

            if (event.name !== CheckoutEventNames.CHECKOUT_COMPLETED) return;
            const transactionId = readTransactionId(event);
            if (!transactionId || typeof window === "undefined") return;
            window.dispatchEvent(
              new CustomEvent<PaddleCheckoutCompletedDetail>(PADDLE_CHECKOUT_COMPLETED_EVENT, {
                detail: { transactionId },
              }),
            );
          },
        }),
      )
      .then((instance) => {
        if (cancelled) return;
        if (instance) setPaddle(instance);
        setInitializing(false);
      })
      .catch(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [configured, environment, token]);

  const value: PaddleContextValue = {
    paddle,
    ready: Boolean(paddle),
    initializing,
    configured,
  };

  return <PaddleContext.Provider value={value}>{children}</PaddleContext.Provider>;
};

export const usePaddle = (): PaddleContextValue => {
  const value = useContext(PaddleContext);
  if (!value) {
    throw new Error("usePaddle must be used within PaddleProvider");
  }
  return value;
};

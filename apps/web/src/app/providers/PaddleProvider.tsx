"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { readPaddleClientEnv } from "./paddleClientEnv";
import { loadPaddleSdk } from "./loadPaddleSdk";

type PaddleContextValue = {
  paddle: Paddle | null;
  ready: boolean;
  initializing: boolean;
  configured: boolean;
};

const PaddleContext = createContext<PaddleContextValue | undefined>(undefined);

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

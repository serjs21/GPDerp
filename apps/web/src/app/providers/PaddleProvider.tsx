"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckoutEventNames, initializePaddle, type Paddle } from "@paddle/paddle-js";

type CheckoutCompletedHandler = () => void;

type PaddleContextValue = {
  paddle: Paddle | null;
  ready: boolean;
  setCheckoutCompletedHandler: (handler: CheckoutCompletedHandler | null) => void;
};

const PaddleContext = createContext<PaddleContextValue | undefined>(undefined);

const paddleEnvironment = (): "sandbox" | "production" =>
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";

export const PaddleProvider = ({ children }: { children: ReactNode }) => {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const checkoutCompletedHandlerRef = useRef<CheckoutCompletedHandler | null>(null);

  const setCheckoutCompletedHandler = (handler: CheckoutCompletedHandler | null) => {
    checkoutCompletedHandlerRef.current = handler;
  };

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;

    let cancelled = false;
    void initializePaddle({
      token,
      environment: paddleEnvironment(),
      eventCallback: (event) => {
        if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
          checkoutCompletedHandlerRef.current?.();
        }
      },
    }).then((instance) => {
      if (!cancelled && instance) setPaddle(instance);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value: PaddleContextValue = {
    paddle,
    ready: Boolean(paddle),
    setCheckoutCompletedHandler,
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

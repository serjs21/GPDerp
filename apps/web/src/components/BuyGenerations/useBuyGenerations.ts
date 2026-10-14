"use client";

import { useEffect, useRef, useState } from "react";
import { comicToast } from "@/components/ComicToast";
import { confirmPurchase, createCheckout, notifyGenerationCreditsUpdated, notifyGenerationPurchaseConfirmed } from "@/api/payments";
import {
  PADDLE_CHECKOUT_COMPLETED_EVENT,
  usePaddle,
  type PaddleCheckoutCompletedDetail,
} from "@/app/providers/PaddleProvider";
import { openPaddleCheckoutWithFallback } from "@/app/providers/openPaddleCheckoutWithFallback";
import { readPaddleClientEnv } from "@/app/providers/paddleClientEnv";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { useTranslations } from "next-intl";

function readTxnFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const txn = new URLSearchParams(window.location.search).get("txn");
  return txn && txn.startsWith("txn_") ? txn : null;
}

export function useBuyGenerations() {
  const t = useTranslations("BuyGenerations");
  const { configured, ensurePaddle } = usePaddle();
  const { user, isLoggedIn } = useAuthenticationState();
  const { requestAuthentication } = useAuthenticationVerification();
  const paddleEnv = readPaddleClientEnv();
  const [startingCheckout, setStartingCheckout] = useState(false);
  const startingCheckoutRef = useRef(false);
  const confirmingRef = useRef(false);

  const applyConfirmedCredits = async (transactionId: string) => {
    if (confirmingRef.current) return;
    confirmingRef.current = true;
    try {
      const data = await confirmPurchase(transactionId);
      notifyGenerationCreditsUpdated(data.credits);
      notifyGenerationPurchaseConfirmed(data.message);
    } catch {
      comicToast.error(t("confirmError"));
    } finally {
      confirmingRef.current = false;
    }
  };

  useEffect(() => {
    const txn = readTxnFromLocation();
    if (!txn) return;
    void applyConfirmedCredits(txn).then(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("txn");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on return from top-level checkout
  }, []);

  useEffect(() => {
    const onCompleted = (event: Event) => {
      const detail = (event as CustomEvent<PaddleCheckoutCompletedDetail>).detail;
      const transactionId = detail?.transactionId;
      if (!transactionId) return;
      void applyConfirmedCredits(transactionId);
    };

    window.addEventListener(PADDLE_CHECKOUT_COMPLETED_EVENT, onCompleted);
    return () => window.removeEventListener(PADDLE_CHECKOUT_COMPLETED_EVENT, onCompleted);
  }, [t]);

  /** Warm the SDK on purchase intent (hover/focus/modal open) so the click opens checkout fast. */
  const prepareCheckout = () => {
    if (isLoggedIn) void ensurePaddle();
  };

  const buy = async () => {
    if (!requestAuthentication()) return;
    if (startingCheckoutRef.current || !paddleEnv.priceId) return;

    startingCheckoutRef.current = true;
    setStartingCheckout(true);
    try {
      // Before createCheckout, so a failed SDK load never leaves an orphan server transaction.
      const paddle = await ensurePaddle();
      if (!paddle) throw new Error("Paddle unavailable");
      const checkout = await createCheckout();
      const transactionId = checkout.transactionId;
      const email = user.email.trim();
      const successUrl = `${window.location.origin}/?txn=${encodeURIComponent(transactionId)}`;

      await openPaddleCheckoutWithFallback(
        (opts) => paddle.Checkout.open(opts),
        {
          transactionId,
          ...(email ? { customer: { email } } : {}),
          settings: {
            displayMode: "overlay",
            successUrl,
          },
        },
      );
    } catch {
      comicToast.error(t("error"));
    } finally {
      startingCheckoutRef.current = false;
      setStartingCheckout(false);
    }
  };

  return {
    startingCheckout,
    // The SDK loads on demand inside `buy()` (covered by `startingCheckout`), so Buy is enabled up front.
    checkoutReady: configured && Boolean(paddleEnv.priceId),
    prepareCheckout,
    buy,
  };
}

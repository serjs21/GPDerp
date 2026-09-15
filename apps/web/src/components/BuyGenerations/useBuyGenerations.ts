"use client";

import { useEffect, useRef, useState } from "react";
import { comicToast } from "@/components/ComicToast";
import { confirmPurchase, createCheckout, fetchCredits } from "@/api/payments";
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
  const { paddle, ready, initializing, configured } = usePaddle();
  const { user } = useAuthenticationState();
  const { requestAuthentication } = useAuthenticationVerification();
  const paddleEnv = readPaddleClientEnv();
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const startingCheckoutRef = useRef(false);
  const confirmingRef = useRef(false);

  const applyConfirmedCredits = async (transactionId: string) => {
    if (confirmingRef.current) return;
    confirmingRef.current = true;
    try {
      const data = await confirmPurchase(transactionId);
      setCredits(data.credits);
      comicToast.success(t("success"));
    } catch {
      comicToast.error(t("confirmError"));
    } finally {
      confirmingRef.current = false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    void fetchCredits()
      .then((data) => {
        if (!cancelled) setCredits(data.credits);
      })
      .catch(() => {
        if (!cancelled) setCredits(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCredits(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const buy = async () => {
    if (!requestAuthentication()) return;
    if (!paddle || startingCheckoutRef.current || !paddleEnv.priceId) return;

    startingCheckoutRef.current = true;
    setStartingCheckout(true);
    try {
      const checkout = await createCheckout();
      const transactionId = checkout.transactionId;
      const email = user.email.trim();
      const successUrl = `${window.location.origin}/settings?txn=${encodeURIComponent(transactionId)}`;

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
    credits,
    loadingCredits,
    startingCheckout,
    initializing,
    checkoutReady: configured && ready && Boolean(paddle) && Boolean(paddleEnv.priceId),
    buy,
  };
}

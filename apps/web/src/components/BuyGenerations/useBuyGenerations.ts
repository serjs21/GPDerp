"use client";

import { useEffect, useRef, useState } from "react";
import { comicToast } from "@/components/ComicToast";
import { createPendingPurchase, fetchCredits } from "@/api/payments";
import { usePaddle } from "@/app/providers/PaddleProvider";
import { readPaddleClientEnv } from "@/app/providers/paddleClientEnv";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { useTranslations } from "next-intl";

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

  const buy = async () => {
    if (!requestAuthentication()) return;
    if (!paddle || startingCheckoutRef.current || !paddleEnv.priceId) return;

    startingCheckoutRef.current = true;
    setStartingCheckout(true);
    try {
      const { purchaseId } = await createPendingPurchase();
      const email = user.email.trim();
      paddle.Checkout.open({
        items: [{ priceId: paddleEnv.priceId, quantity: 1 }],
        customData: { purchaseId },
        ...(email ? { customer: { email } } : {}),
        settings: { displayMode: "overlay" },
      });
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

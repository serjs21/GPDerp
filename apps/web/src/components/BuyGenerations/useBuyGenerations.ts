"use client";

import { useEffect, useRef, useState } from "react";
import { comicToast } from "@/components/ComicToast";
import { createCheckout, fetchCredits } from "@/api/payments";
import { usePaddle } from "@/app/providers/PaddleProvider";
import { useTranslations } from "next-intl";

const POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 1500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useBuyGenerations() {
  const t = useTranslations("BuyGenerations");
  const { paddle, ready, setCheckoutCompletedHandler } = usePaddle();
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const creditsRef = useRef(0);
  const pollingRef = useRef(false);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    let cancelled = false;
    void fetchCredits()
      .then((data) => {
        if (!cancelled) {
          setCredits(data.credits);
          creditsRef.current = data.credits;
        }
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
    const pollUntilCreditsIncrease = async (previous: number) => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      comicToast.info(tRef.current("confirming"));
      try {
        for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
          await wait(POLL_INTERVAL_MS);
          const next = await fetchCredits();
          setCredits(next.credits);
          creditsRef.current = next.credits;
          if (next.credits > previous) {
            comicToast.success(tRef.current("ready"));
            return;
          }
        }
        comicToast.info(tRef.current("pending"));
      } catch {
        comicToast.info(tRef.current("pending"));
      } finally {
        pollingRef.current = false;
      }
    };

    setCheckoutCompletedHandler(() => {
      void pollUntilCreditsIncrease(creditsRef.current);
    });
    return () => setCheckoutCompletedHandler(null);
    // setCheckoutCompletedHandler only writes a ref; listing it would re-bind on every provider render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = async () => {
    if (!paddle || startingCheckout) return;
    try {
      setStartingCheckout(true);
      const checkout = await createCheckout();
      paddle.Checkout.open({
        items: [{ priceId: checkout.priceId, quantity: 1 }],
        customData: { purchaseReference: checkout.purchaseReference },
        settings: { displayMode: "overlay" },
      });
    } catch {
      comicToast.error(t("error"));
    } finally {
      setStartingCheckout(false);
    }
  };

  return {
    credits,
    loadingCredits,
    startingCheckout,
    checkoutReady: ready && Boolean(paddle),
    buy,
  };
}

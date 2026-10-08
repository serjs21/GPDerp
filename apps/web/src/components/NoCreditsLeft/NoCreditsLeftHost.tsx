"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useBuyGenerations } from "@/components/BuyGenerations";
import {
  NO_GENERATIONS_LEFT_FALLBACK_MESSAGE,
  NoGenerationsLeftModal,
} from "@/components/NoGenerationsLeftModal";
import { NO_CREDITS_LEFT_EVENT } from "@/config/userConfiguration";
import { savePendingHaikuAfterPurchase, type NoCreditsLeftDetail } from "./pendingHaikuAfterPurchase";

export function NoCreditsLeftHost() {
  const t = useTranslations("NoGenerationsLeftModal");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { buy, startingCheckout, initializing, checkoutReady } = useBuyGenerations();

  useEffect(() => {
    const onNeedCredits = (event: Event) => {
      const detail = (event as CustomEvent<Partial<NoCreditsLeftDetail>>).detail;
      if (typeof detail?.subject === "string") savePendingHaikuAfterPurchase(detail.subject);
      setMessage(detail?.message || null);
      setOpen(true);
    };
    window.addEventListener(NO_CREDITS_LEFT_EVENT, onNeedCredits);
    return () => window.removeEventListener(NO_CREDITS_LEFT_EVENT, onNeedCredits);
  }, []);

  return (
    <NoGenerationsLeftModal
      open={open}
      onOpenChange={setOpen}
      message={message || t(NO_GENERATIONS_LEFT_FALLBACK_MESSAGE)}
      buying={startingCheckout || initializing}
      buyDisabled={!checkoutReady || startingCheckout || initializing}
      onBuy={() => void buy()}
    />
  );
}

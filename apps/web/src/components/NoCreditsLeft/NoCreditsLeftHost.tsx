"use client";

import { useEffect, useState } from "react";
import { useBuyGenerations } from "@/components/BuyGenerations";
import { NO_CREDITS_LEFT_EVENT } from "@/config/userConfiguration";
import { NoCreditsLeft } from "./NoCreditsLeft";
import { savePendingHaikuAfterPurchase } from "./pendingHaikuAfterPurchase";

export function NoCreditsLeftHost() {
  const [open, setOpen] = useState(false);
  const { buy, startingCheckout, initializing, checkoutReady } = useBuyGenerations();

  useEffect(() => {
    const onNeedCredits = (event: Event) => {
      const subject = (event as CustomEvent<{ subject?: string }>).detail?.subject;
      if (typeof subject === "string") savePendingHaikuAfterPurchase(subject);
      setOpen(true);
    };
    window.addEventListener(NO_CREDITS_LEFT_EVENT, onNeedCredits);
    return () => window.removeEventListener(NO_CREDITS_LEFT_EVENT, onNeedCredits);
  }, []);

  return (
    <NoCreditsLeft
      open={open}
      onOpenChange={setOpen}
      buying={startingCheckout || initializing}
      buyDisabled={!checkoutReady || startingCheckout || initializing}
      onBuy={() => void buy()}
    />
  );
}

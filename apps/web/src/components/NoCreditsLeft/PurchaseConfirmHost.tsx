"use client";

import { useEffect, useState } from "react";
import {
  GENERATION_PURCHASE_CONFIRMED_EVENT,
  type GenerationPurchaseConfirmedDetail,
} from "@/api/payments";
import { PurchaseConfirmModal } from "@/components/PurchaseConfirmModal";
import { GENERATION_PURCHASE_ACKNOWLEDGED_EVENT } from "@/config/userConfiguration";

export function PurchaseConfirmHost() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onConfirmed = (event: Event) => {
      const detail = (event as CustomEvent<Partial<GenerationPurchaseConfirmedDetail>>).detail;
      setMessage(detail?.message ?? "");
      setOpen(true);
    };
    window.addEventListener(GENERATION_PURCHASE_CONFIRMED_EVENT, onConfirmed);
    return () => window.removeEventListener(GENERATION_PURCHASE_CONFIRMED_EVENT, onConfirmed);
  }, []);

  return (
    <PurchaseConfirmModal
      open={open}
      message={message}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) window.dispatchEvent(new Event(GENERATION_PURCHASE_ACKNOWLEDGED_EVENT));
      }}
    />
  );
}

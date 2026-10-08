"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ComicConfirmModal } from "@/components/ComicConfirmModal/ComicConfirmModal";
import {
  GENERATION_PURCHASE_ACKNOWLEDGED_EVENT,
  PENDING_HAIKU_SUBJECT_STORAGE_KEY,
  RESUME_PENDING_HAIKU_EVENT,
} from "@/config/userConfiguration";
import {
  clearPendingHaikuAfterPurchase,
  readPendingHaikuAfterPurchase,
} from "./pendingHaikuAfterPurchase";

export function ContinueGenerationOffer() {
  const t = useTranslations("NoCreditsLeft.continueGenerationOffer");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const onConfirmed = () => {
      const pending = readPendingHaikuAfterPurchase();
      if (!pending) return;
      setSubject(pending);
      setOpen(true);
    };
    window.addEventListener(GENERATION_PURCHASE_ACKNOWLEDGED_EVENT, onConfirmed);
    return () => window.removeEventListener(GENERATION_PURCHASE_ACKNOWLEDGED_EVENT, onConfirmed);
  }, []);

  return (
    <ComicConfirmModal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) clearPendingHaikuAfterPurchase();
      }}
      question={subject ? t("questionWithSubject", { subject }) : t("question")}
      confirmLabel={t("confirm")}
      cancelLabel={t("cancel")}
      onConfirm={() => {
        window.localStorage.setItem(PENDING_HAIKU_SUBJECT_STORAGE_KEY, subject);
        clearPendingHaikuAfterPurchase();
        if (pathname === "/") {
          window.dispatchEvent(new Event(RESUME_PENDING_HAIKU_EVENT));
        } else {
          router.push("/");
        }
      }}
    />
  );
}

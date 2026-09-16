import {
  NO_CREDITS_LEFT_EVENT,
  PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY,
} from "@/config/userConfiguration";

export function savePendingHaikuAfterPurchase(subject: string) {
  const trimmed = subject.trim();
  if (!trimmed) return;
  window.localStorage.setItem(PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY, trimmed);
}

export function readPendingHaikuAfterPurchase(): string | null {
  const pending = window.localStorage.getItem(PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY);
  return pending?.trim() ? pending.trim() : null;
}

export function clearPendingHaikuAfterPurchase() {
  window.localStorage.removeItem(PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY);
}

export function openNoCreditsLeft(subject: string) {
  savePendingHaikuAfterPurchase(subject);
  window.dispatchEvent(new CustomEvent(NO_CREDITS_LEFT_EVENT, { detail: { subject } }));
}

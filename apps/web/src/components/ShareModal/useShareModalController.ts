import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { comicToast } from "@/components/ComicToast";
import type { HaikuDto } from "@/api/haikus";
import {
  fetchShareLinkForHaiku,
  shareHaikuByEmail,
  type ShareLinkListItem,
} from "@/api/shareLinks";
import type { ShareMethod } from "./types";
import { useSharePostcardFront } from "./useSharePostcardFront";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const EMPTY_EMAIL_RECIPIENTS: string[] = [];

const getAxiosErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!axios.isAxiosError(error)) return fallbackMessage;
  const apiMessage = (error.response?.data as { error?: string } | undefined)?.error;
  return typeof apiMessage === "string" ? apiMessage : fallbackMessage;
};

const stubCreatedLinkFromUrl = (
  shareUrl: string,
  haikuSubject: string,
  haikuId: string,
): ShareLinkListItem => ({
  id: "00000000-0000-4000-8000-000000000001",
  shareHash: "demo-hash",
  shareUrl,
  sharedHaikuId: haikuId,
  haikuSubject,
  createdAt: new Date().toISOString(),
  expirationDate: null,
  maxViews: null,
  viewCount: 0,
  disabled: false,
  showLabels: true,
});

type UseShareModalControllerParams = {
  open: boolean;
  haikuId: string;
  haikuSubject?: string;
  initialCreatedUrl?: string | null;
  initialCreatedLink?: ShareLinkListItem | null;
  /** When true, skip network fetch and start with no share link (Storybook). */
  initialEmptyLink?: boolean;
  initialMethod?: ShareMethod;
  initialEmailRecipients?: string[];
  /** Full haiku; when present (with a celestial theme) the email includes postcard images. */
  haiku?: HaikuDto | null;
  /** Called once the postcards are queued (the modal closes). */
  onEmailQueued?: () => void;
};

export function useShareModalController({
  open,
  haikuId,
  haiku = null,
  haikuSubject: haikuSubjectParam,
  initialCreatedUrl = null,
  initialCreatedLink = null,
  initialEmptyLink = false,
  initialMethod = "link",
  initialEmailRecipients = EMPTY_EMAIL_RECIPIENTS,
  onEmailQueued,
}: UseShareModalControllerParams) {
  const t = useTranslations("ShareModal.controller");
  const haikuSubject = haikuSubjectParam ?? t("defaultSubject");
  const [method, setMethod] = useState<ShareMethod>("link");
  const [shareLink, setShareLink] = useState<ShareLinkListItem | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { preparingPostcard, preparePostcardFront } = useSharePostcardFront(haiku);

  useEffect(() => {
    if (!open) return;
    setMethod(initialMethod);
    setEmailMessage("");
    setEmailRecipients(initialEmailRecipients);
    setSendingEmail(false);
    if (initialCreatedLink) {
      setShareLink(initialCreatedLink);
      setLoadingLink(false);
      return;
    }
    if (initialCreatedUrl) {
      setShareLink(stubCreatedLinkFromUrl(initialCreatedUrl, haikuSubject, haikuId));
      setLoadingLink(false);
      return;
    }
    if (initialEmptyLink) {
      setShareLink(null);
      setLoadingLink(false);
      return;
    }

    let cancelled = false;
    setShareLink(null);
    setLoadingLink(true);
    void (async () => {
      try {
        const existing = await fetchShareLinkForHaiku(haikuId);
        if (!cancelled) setShareLink(existing);
      } catch (e) {
        if (!cancelled) {
          setShareLink(null);
          comicToast.error(getAxiosErrorMessage(e, t("loadLinkError")));
        }
      } finally {
        if (!cancelled) setLoadingLink(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    haikuId,
    haikuSubject,
    initialCreatedUrl,
    initialCreatedLink,
    initialEmptyLink,
    initialMethod,
    initialEmailRecipients,
    t,
  ]);

  const normalizedEmails = useMemo(
    () => [...new Set(emailRecipients.map((v) => v.trim().toLowerCase()))].filter(Boolean),
    [emailRecipients],
  );
  const invalidEmails = useMemo(
    () => normalizedEmails.filter((email) => !EMAIL_REGEX.test(email)),
    [normalizedEmails],
  );
  const canSendEmail = normalizedEmails.length > 0 && invalidEmails.length === 0;

  const emailCtaHint =
    canSendEmail || sendingEmail
      ? ""
      : t(normalizedEmails.length === 0 ? "addRecipientHint" : "fixInvalidHint");

  const onSendEmail = async () => {
    if (!canSendEmail) return;
    setSendingEmail(true);
    const message = emailMessage.trim();
    try {
      const front = await preparePostcardFront();
      if (front === null) return;
      await shareHaikuByEmail({ haikuId, emails: normalizedEmails, message, postcard: front && { front } });
      comicToast.success(t("postcardsQueued"));
      onEmailQueued?.();
    } catch (e) {
      comicToast.error(getAxiosErrorMessage(e, t("sendEmailError")));
    } finally {
      setSendingEmail(false);
    }
  };

  return {
    method,
    setMethod,
    shareLink,
    setShareLink,
    loadingLink,
    emailMessage,
    setEmailMessage,
    emailRecipients,
    setEmailRecipients,
    sendingEmail,
    preparingPostcard,
    invalidEmails,
    canSendEmail,
    emailCtaHint,
    onSendEmail,
  };
}

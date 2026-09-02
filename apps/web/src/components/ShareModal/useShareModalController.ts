import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { comicToast } from "@/components/ComicToast";
import { createShareLink, shareHaikuByEmail } from "@/api/shareLinks";
import type { LinkPolicy, ShareMethod } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DEFAULT_MAX_VIEWS = 3;
const EMPTY_EMAIL_RECIPIENTS: string[] = [];

const getAxiosErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!axios.isAxiosError(error)) return fallbackMessage;
  const apiMessage = (error.response?.data as { error?: string } | undefined)?.error;
  return typeof apiMessage === "string" ? apiMessage : fallbackMessage;
};

const getLinkCtaHint = (linkPolicy: LinkPolicy) =>
  linkPolicy === "expires"
    ? "Pick a future expiration date"
    : linkPolicy === "limited"
      ? "Max views should be at least 1"
      : "Invalid share link settings";

const getEmailCtaHint = (normalizedEmailsCount: number) =>
  normalizedEmailsCount === 0 ? "Add at least one recipient email" : "Fix invalid recipient emails";

const getCreateLinkEligibility = ({
  linkPolicy,
  expiresAt,
  maxViews,
}: {
  linkPolicy: LinkPolicy;
  expiresAt: Dayjs | null;
  maxViews: number | null;
}) =>
  linkPolicy === "permanent" ||
  (linkPolicy === "expires" && expiresAt != null && expiresAt.isAfter(dayjs())) ||
  (linkPolicy === "limited" && maxViews != null && maxViews >= 1);

const buildShareLinkPayload = ({
  haikuId,
  linkPolicy,
  expiresAt,
  maxViews,
}: {
  haikuId: string;
  linkPolicy: LinkPolicy;
  expiresAt: Dayjs | null;
  maxViews: number | null;
}) => {
  if (linkPolicy === "permanent") {
    return { haikuId, expirationDate: null, maxViews: null };
  }
  if (linkPolicy === "expires") {
    return { haikuId, expirationDate: expiresAt!.toISOString(), maxViews: null };
  }
  return { haikuId, expirationDate: null, maxViews: maxViews! };
};

type UseShareModalControllerParams = {
  open: boolean;
  haikuId: string;
  initialCreatedUrl?: string | null;
  initialMethod?: ShareMethod;
  initialLinkPolicy?: LinkPolicy;
  initialEmailRecipients?: string[];
};

export function useShareModalController({
  open,
  haikuId,
  initialCreatedUrl = null,
  initialMethod = "link",
  initialLinkPolicy = "permanent",
  initialEmailRecipients = EMPTY_EMAIL_RECIPIENTS,
}: UseShareModalControllerParams) {
  const [method, setMethod] = useState<ShareMethod>("link");
  const [linkPolicy, setLinkPolicy] = useState<LinkPolicy>("permanent");
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);
  const [maxViews, setMaxViews] = useState<number | null>(DEFAULT_MAX_VIEWS);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMethod(initialMethod);
    setLinkPolicy(initialLinkPolicy);
    setExpiresAt(null);
    setMaxViews(DEFAULT_MAX_VIEWS);
    setCreatedUrl(initialCreatedUrl ?? null);
    setEmailMessage("");
    setEmailRecipients(initialEmailRecipients);
    setSendingEmail(false);
    setEmailSent(false);
  }, [open, initialCreatedUrl, initialMethod, initialLinkPolicy, initialEmailRecipients]);

  useEffect(() => {
    if (linkPolicy !== "limited") return;
    setMaxViews((v) => (v != null && v >= 1 ? v : DEFAULT_MAX_VIEWS));
  }, [linkPolicy]);

  const normalizedEmails = useMemo(
    () => [...new Set(emailRecipients.map((v) => v.trim().toLowerCase()))].filter(Boolean),
    [emailRecipients],
  );
  const invalidEmails = useMemo(
    () => normalizedEmails.filter((email) => !EMAIL_REGEX.test(email)),
    [normalizedEmails],
  );
  const canSendEmail = normalizedEmails.length > 0 && invalidEmails.length === 0;
  const canCreateLink = getCreateLinkEligibility({ linkPolicy, expiresAt, maxViews });

  const linkCtaHint = canCreateLink ? "" : getLinkCtaHint(linkPolicy);
  const emailCtaHint =
    canSendEmail || sendingEmail
      ? ""
      : getEmailCtaHint(normalizedEmails.length);

  const onCreateLink = async () => {
    if (!canCreateLink) return;
    setCreating(true);
    try {
      const body = buildShareLinkPayload({ haikuId, linkPolicy, expiresAt, maxViews });
      const data = await createShareLink(body);
      setCreatedUrl(data.shareUrl);
      comicToast.success("Share link created");
    } catch (e) {
      comicToast.error(getAxiosErrorMessage(e, "Could not create share link"));
    } finally {
      setCreating(false);
    }
  };

  const onSendEmail = async () => {
    if (!canSendEmail) return;
    setSendingEmail(true);
    try {
      const sentCount = await shareHaikuByEmail({
        haikuId,
        emails: normalizedEmails,
        message: emailMessage.trim(),
      });
      setEmailSent(true);
      comicToast.success(sentCount === 1 ? "Your haiku has been sent" : `Your haikus have been sent (${sentCount})`);
    } catch (e) {
      comicToast.error(getAxiosErrorMessage(e, "Could not send email"));
    } finally {
      setSendingEmail(false);
    }
  };

  return {
    method,
    setMethod,
    linkPolicy,
    setLinkPolicy,
    expiresAt,
    setExpiresAt,
    maxViews,
    setMaxViews,
    createdUrl,
    setCreatedUrl,
    creating,
    emailMessage,
    setEmailMessage,
    emailRecipients,
    setEmailRecipients,
    sendingEmail,
    emailSent,
    invalidEmails,
    canSendEmail,
    canCreateLink,
    linkCtaHint,
    emailCtaHint,
    onCreateLink,
    onSendEmail,
  };
}

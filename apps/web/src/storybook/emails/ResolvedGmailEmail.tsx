"use client";

import { useMemo } from "react";
import { GmailMessageView } from "./GmailMessageView";
import type { ResolvedGmailEmailProps } from "./ResolvedGmailEmail.types";
import { usePostcardFrontUrl } from "./usePostcardFrontUrl";
import { sanitizeForGmail } from "./utils/gmailSanitize";
import { resolveInlineImages } from "./utils/resolveInlineImages";

/** Inline images resolved (postcard front rendered in the browser), then filtered as Gmail would. */
export function ResolvedGmailEmail({ email, viewport, defaultTab }: ResolvedGmailEmailProps) {
  const postcardFrontUrl = usePostcardFrontUrl(email.postcardHaiku);
  const bodyHtml = useMemo(
    () => sanitizeForGmail(resolveInlineImages(email.html, email.inlineImages, postcardFrontUrl)),
    [email.html, email.inlineImages, postcardFrontUrl],
  );

  return <GmailMessageView key={defaultTab} email={email} bodyHtml={bodyHtml} viewport={viewport} defaultTab={defaultTab} />;
}

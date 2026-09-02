"use client";

import { Button, Typography } from "@/components/StyledComponents";
import type { RadioChangeEvent } from "antd/es/radio";
import { useRef } from "react";
import {
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { CopyText } from "../CopyText/CopyText";
import { SendShareEmailContent } from "./SendShareEmailContent";
import { ShareEmailSendPanel } from "./ShareEmailSendPanel";
import { ShareLinkContent } from "./ShareLinkContent";
import { ShareMethodIcon } from "./ShareMethodIcon";
import styles from "./ShareModal.module.css";
import type { LinkPolicy, ShareMethod } from "./types";
import { useShareModalController } from "./useShareModalController";

export type { LinkPolicy, ShareMethod } from "./types";

export type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  haikuId: string;
  /** When the modal opens, start in the “link created” view (for Storybook). */
  initialCreatedUrl?: string | null;
  /** When the modal opens, pre-select a share method (for Storybook). */
  initialMethod?: ShareMethod;
  /** When the modal opens, pre-select link policy (for Storybook). */
  initialLinkPolicy?: LinkPolicy;
  /** When the modal opens, pre-fill recipient emails (for Storybook). */
  initialEmailRecipients?: string[];
};

const SELECTED_PANEL_WEIGHT = 1.25;
const UNSELECTED_PANEL_WEIGHT = 0.75;
const EMPTY_EMAIL_RECIPIENTS: string[] = [];

export function ShareModal({
  open,
  onClose,
  haikuId,
  initialCreatedUrl = null,
  initialMethod = "link",
  initialLinkPolicy = "permanent",
  initialEmailRecipients = EMPTY_EMAIL_RECIPIENTS,
}: ShareModalProps) {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  // #region agent log
  if (renderCountRef.current <= 20) {
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
      body: JSON.stringify({
        sessionId: "53a752",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "ShareModal.tsx:render",
        message: "ShareModal render",
        data: {
          renderCount: renderCountRef.current,
          recipientsIsDefaultEmpty: initialEmailRecipients === EMPTY_EMAIL_RECIPIENTS,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

  const {
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
  } = useShareModalController({
    open,
    haikuId,
    initialCreatedUrl,
    initialMethod,
    initialLinkPolicy,
    initialEmailRecipients,
  });

  const onLinkPolicyChange = (e: RadioChangeEvent) => {
    setLinkPolicy(e.target.value);
    setCreatedUrl(null);
  };

  const showMethodRow = createdUrl == null && !emailSent;

  const selectLink = () => {
    setMethod("link");
    setCreatedUrl(null);
  };

  const selectEmail = () => {
    setMethod("email");
    setCreatedUrl(null);
  };

  return (
    <ComicPageDialog
      open={open}
      showClose
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      {showMethodRow ? (
        <ComicPageRow className={styles.methodRow}>
          <ComicPagePanel
            selectable
            selected={method === "link"}
            onSelect={selectLink}
            background="sunburst"
            color="teal"
            title="Link"
            flexWeight={method === "link" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
            ariaLabel="Share by link"
            className={styles.methodPanel}
          >
            <ShareMethodIcon src="/share_modal/link.svg" bubbleStyle="pointedArcs" sourceDirection="none"/>
          </ComicPagePanel>
          <ComicPagePanel
            selectable
            selected={method === "email"}
            onSelect={selectEmail}
            background="halftone"
            color="orange"
            flexWeight={method === "email" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
            ariaLabel="Share via email"
            title="Email"
            className={styles.methodPanel}
          >
            <ShareMethodIcon src="/share_modal/email.svg" bubbleStyle="rectangle" sourceDirection="none" />
          </ComicPagePanel>
        </ComicPageRow>
      ) : null}

      <ComicPageRow>
        <ComicPagePanel span="full" color="white" contentAlign="start" className={styles.contentPanel}>
          {createdUrl != null ? (
            <div className={styles.successBlock}>
              <CopyText text={createdUrl} mode="link" />
              <Button type="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : emailSent ? (
            <div className={styles.successBlock}>
              <Typography.Paragraph className={styles.success}>
                Your haikus have been sent.
              </Typography.Paragraph>
              <Button type="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : method === "link" ? (
            <ShareLinkContent
              linkPolicy={linkPolicy}
              onLinkPolicyChange={onLinkPolicyChange}
              expiresAt={expiresAt}
              onExpiresAtChange={setExpiresAt}
              maxViews={maxViews}
              onMaxViewsChange={(v) => setMaxViews(typeof v === "number" ? v : null)}
              canCreateLink={canCreateLink}
              creating={creating}
              linkCtaHint={linkCtaHint}
              onCreateLink={() => void onCreateLink()}
            />
          ) : (
            <SendShareEmailContent
              message={emailMessage}
              emails={emailRecipients}
              invalidEmails={invalidEmails}
              onMessageChange={setEmailMessage}
              onEmailsChange={setEmailRecipients}
              disabled={sendingEmail}
            />
          )}
        </ComicPagePanel>
      </ComicPageRow>

      {method === "email" && !emailSent && createdUrl == null ? (
        <ShareEmailSendPanel
          canSendEmail={canSendEmail}
          sendingEmail={sendingEmail}
          emailCtaHint={emailCtaHint}
          onSendEmail={() => void onSendEmail()}
        />
      ) : null}
    </ComicPageDialog>
  );
}

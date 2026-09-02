"use client";

import { Button, Typography } from "@/components/StyledComponents";
import type { RadioChangeEvent } from "antd/es/radio";
import {
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { ShareLink } from "@/components/ShareLink/ShareLink";
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
  /** Display title for the created ShareLink row. */
  haikuSubject?: string;
  /** When the modal opens, start in the “link created” view (for Storybook). */
  initialCreatedUrl?: string | null;
  /** Prefer full link object when available (Storybook / resume). */
  initialCreatedLink?: ShareLinkListItem | null;
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
  haikuSubject = "Haiku",
  initialCreatedUrl = null,
  initialCreatedLink = null,
  initialMethod = "link",
  initialLinkPolicy = "permanent",
  initialEmailRecipients = EMPTY_EMAIL_RECIPIENTS,
}: ShareModalProps) {
  const {
    method,
    setMethod,
    linkPolicy,
    setLinkPolicy,
    expiresAt,
    setExpiresAt,
    maxViews,
    setMaxViews,
    createdLink,
    setCreatedLink,
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
    haikuSubject,
    initialCreatedUrl,
    initialCreatedLink,
    initialMethod,
    initialLinkPolicy,
    initialEmailRecipients,
  });

  const onLinkPolicyChange = (e: RadioChangeEvent) => {
    setLinkPolicy(e.target.value);
    setCreatedLink(null);
  };

  const showMethodRow = createdLink == null && !emailSent;

  const selectLink = () => {
    setMethod("link");
    setCreatedLink(null);
  };

  const selectEmail = () => {
    setMethod("email");
    setCreatedLink(null);
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
            <ShareMethodIcon src="/share_modal/link.svg" bubbleStyle="pointedArcs" sourceDirection="none" />
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
      ) : (
        <div className={styles.methodRowSpacer} aria-hidden />
      )}

      <div className={styles.contentSlot}>
        {createdLink != null ? (
          <ShareLink link={createdLink} onChanged={() => undefined} onLinkUpdate={setCreatedLink} />
        ) : emailSent ? (
          <ComicPagePanel span="full" color="white" contentAlign="start" className={styles.contentPanel}>
            <div className={styles.successBlock}>
              <Typography.Paragraph className={styles.success}>
                Your haikus have been sent.
              </Typography.Paragraph>
              <Button type="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </ComicPagePanel>
        ) : (
          <ComicPagePanel span="full" color="white" contentAlign="start" className={styles.contentPanel}>
            {method === "link" ? (
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
        )}
      </div>

      {method === "email" && !emailSent && createdLink == null ? (
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

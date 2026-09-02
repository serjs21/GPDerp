"use client";

import { Button, Tooltip, Typography } from "@/components/StyledComponents";
import type { RadioChangeEvent } from "antd/es/radio";
import {
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { CopyText } from "../CopyText/CopyText";
import { SendShareEmailContent } from "./SendShareEmailContent";
import { ShareLinkContent } from "./ShareLinkContent";
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
};

const SELECTED_PANEL_WEIGHT = 1.25;
const UNSELECTED_PANEL_WEIGHT = 0.75;

type ShareModalFooterProps = {
  createdUrl: string | null;
  emailSent: boolean;
  onClose: () => void;
  method: ShareMethod;
  linkCtaHint: string;
  emailCtaHint: string;
  creating: boolean;
  sendingEmail: boolean;
  canCreateLink: boolean;
  canSendEmail: boolean;
  onCreateLink: () => void;
  onSendEmail: () => void;
};

function ShareModalFooter({
  createdUrl,
  emailSent,
  onClose,
  method,
  linkCtaHint,
  emailCtaHint,
  creating,
  sendingEmail,
  canCreateLink,
  canSendEmail,
  onCreateLink,
  onSendEmail,
}: ShareModalFooterProps) {
  if (createdUrl != null || emailSent) {
    return (
      <Button type="primary" onClick={onClose}>
        Done
      </Button>
    );
  }

  return (
    <div className={styles.footerBtns}>
      <Button onClick={onClose}>Close</Button>
      <Tooltip title={method === "link" ? linkCtaHint : emailCtaHint}>
        <span>
          <Button
            type="primary"
            loading={method === "link" ? creating : sendingEmail}
            disabled={method === "link" ? !canCreateLink : !canSendEmail}
            onClick={method === "link" ? onCreateLink : onSendEmail}
          >
            {method === "email" ? "Send" : "Create link"}
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}

export function ShareModal({
  open,
  onClose,
  haikuId,
  initialCreatedUrl = null,
  initialMethod = "link",
  initialLinkPolicy = "permanent",
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
  });

  const onLinkPolicyChange = (e: RadioChangeEvent) => {
    setLinkPolicy(e.target.value);
    setCreatedUrl(null);
  };

  const showMethodRow = createdUrl == null && !emailSent;
  const dialogTitle = createdUrl ? "Your share link" : "Share haiku";

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
            <img src="/share_modal/link.svg" alt="" className={styles.methodIcon} />
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
            <img src="/share_modal/email.svg" alt="" className={styles.methodIcon} />
          </ComicPagePanel>
        </ComicPageRow>
      ) : null}

      <ComicPageRow>
        <ComicPagePanel span="full" color="white" contentAlign="start" className={styles.contentPanel}>
          {createdUrl != null ? (
            <CopyText text={createdUrl} mode="link" />
          ) : emailSent ? (
            <Typography.Paragraph className={styles.success}>
              Your haikus have been sent.
            </Typography.Paragraph>
          ) : method === "link" ? (
            <ShareLinkContent
              linkPolicy={linkPolicy}
              onLinkPolicyChange={onLinkPolicyChange}
              expiresAt={expiresAt}
              onExpiresAtChange={setExpiresAt}
              maxViews={maxViews}
              onMaxViewsChange={(v) => setMaxViews(typeof v === "number" ? v : null)}
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

      <ComicPageRow>
        <ComicPagePanel span="full" color="cream" contentAlign="start" className={styles.footerPanel}>
          <ShareModalFooter
            createdUrl={createdUrl}
            emailSent={emailSent}
            onClose={onClose}
            method={method}
            linkCtaHint={linkCtaHint}
            emailCtaHint={emailCtaHint}
            creating={creating}
            sendingEmail={sendingEmail}
            canCreateLink={canCreateLink}
            canSendEmail={canSendEmail}
            onCreateLink={() => void onCreateLink()}
            onSendEmail={() => void onSendEmail()}
          />
        </ComicPagePanel>
      </ComicPageRow>
    </ComicPageDialog>
  );
}

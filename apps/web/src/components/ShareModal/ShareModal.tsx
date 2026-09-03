"use client";

import { Button, Typography } from "@/components/StyledComponents";
import {
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { ShareLink } from "@/components/ShareLink/ShareLink";
import { SendShareEmailContent } from "./SendShareEmailContent";
import { ShareEmailSendPanel } from "./ShareEmailSendPanel";
import { ShareMethodIcon } from "./ShareMethodIcon";
import styles from "./ShareModal.module.css";
import type { ShareMethod } from "./types";
import { useShareModalController } from "./useShareModalController";

export type { LinkPolicy, ShareMethod } from "./types";

export type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  haikuId: string;
  /** Display title for the ShareLink row. */
  haikuSubject?: string;
  /** When the modal opens, start with a created link (for Storybook). */
  initialCreatedUrl?: string | null;
  /** Prefer full link object when available (Storybook / resume). */
  initialCreatedLink?: ShareLinkListItem | null;
  /** Skip fetch and show empty ShareLink (Storybook). */
  initialEmptyLink?: boolean;
  /** When the modal opens, pre-select a share method (for Storybook). */
  initialMethod?: ShareMethod;
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
  initialEmptyLink = false,
  initialMethod = "link",
  initialEmailRecipients = EMPTY_EMAIL_RECIPIENTS,
}: ShareModalProps) {
  const {
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
    emailSent,
    invalidEmails,
    canSendEmail,
    emailCtaHint,
    onSendEmail,
  } = useShareModalController({
    open,
    haikuId,
    haikuSubject,
    initialCreatedUrl,
    initialCreatedLink,
    initialEmptyLink,
    initialMethod,
    initialEmailRecipients,
  });

  const showMethodRow = !emailSent;

  const selectLink = () => {
    setMethod("link");
  };

  const selectEmail = () => {
    setMethod("email");
  };

  return (
    <ComicPageDialog
      open={open}
      showClose
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <div className={styles.body}>
        {showMethodRow ? (
          <ComicPageRow className={styles.methodRow}>
            <ComicPagePanel
              selectable
              selected={method === "link"}
              onSelect={selectLink}
              background="sunburst"
              color="teal"
              title="Link"
              isMotionBackground={false}
              shine={false}
              sunburstHalftone={false}
              overflowVisible
              flexWeight={method === "link" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
              ariaLabel="Share by link"
              className={styles.methodPanel}
            >
              <ShareMethodIcon
                src="/share_modal/link.svg"
                bubbleStyle="pointedArcs"
                sourceDirection="none"
                active={method === "link"}
              />
            </ComicPagePanel>
            <ComicPagePanel
              selectable
              selected={method === "email"}
              onSelect={selectEmail}
              background="halftone"
              color="orange"
              overflowVisible
              flexWeight={method === "email" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
              ariaLabel="Share via email"
              title="Email"
              className={styles.methodPanel}
            >
              <ShareMethodIcon
                src="/share_modal/email.svg"
                bubbleStyle="rectangle"
                sourceDirection="none"
                active={method === "email"}
              />
            </ComicPagePanel>
          </ComicPageRow>
        ) : null}

        <div className={styles.contentSlot}>
          {emailSent ? (
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
          ) : method === "link" ? (
            loadingLink ? (
              <ComicPagePanel span="full" color="white" contentAlign="center" className={styles.contentPanel}>
                <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                  Loading…
                </Typography.Paragraph>
              </ComicPagePanel>
            ) : (
              <ShareLink
                link={shareLink}
                haikuId={haikuId}
                haikuSubject={haikuSubject}
                onChanged={() => undefined}
                onLinkUpdate={setShareLink}
              />
            )
          ) : (
            <ComicPagePanel span="full" color="white" contentAlign="start" className={styles.contentPanel}>
              <SendShareEmailContent
                message={emailMessage}
                emails={emailRecipients}
                invalidEmails={invalidEmails}
                onMessageChange={setEmailMessage}
                onEmailsChange={setEmailRecipients}
                disabled={sendingEmail}
              />
            </ComicPagePanel>
          )}
        </div>

        {method === "email" && !emailSent ? (
          <div className={styles.sendRow}>
            <ShareEmailSendPanel
              canSendEmail={canSendEmail}
              sendingEmail={sendingEmail}
              emailCtaHint={emailCtaHint}
              onSendEmail={() => void onSendEmail()}
            />
          </div>
        ) : null}
      </div>
    </ComicPageDialog>
  );
}

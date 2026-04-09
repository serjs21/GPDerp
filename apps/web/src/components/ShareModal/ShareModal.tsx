"use client";

import { Button, message, Modal, Radio } from "antd";
import type { RadioChangeEvent } from "antd/es/radio";
import type { Dayjs } from "dayjs";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { createShareLink } from "@/api/shareLinks";
import { CopyText } from "../CopyText/CopyText";
import { SendShareEmailContent } from "./SendShareEmailContent";
import { ShareLinkContent } from "./ShareLinkContent";
import styles from "./ShareModal.module.css";
import type { LinkPolicy, ShareMethod } from "./types";

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

export function ShareModal({
  open,
  onClose,
  haikuId,
  initialCreatedUrl = null,
  initialMethod = "link",
  initialLinkPolicy = "permanent",
}: ShareModalProps) {
  const [method, setMethod] = useState<ShareMethod>("link");
  const [linkPolicy, setLinkPolicy] = useState<LinkPolicy>("permanent");
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);
  const [maxViews, setMaxViews] = useState<number | null>(3);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMethod(initialMethod);
    setLinkPolicy(initialLinkPolicy);
    setExpiresAt(null);
    setMaxViews(3);
    setCreatedUrl(initialCreatedUrl ?? null);
  }, [open, initialCreatedUrl, initialMethod, initialLinkPolicy]);

  useEffect(() => {
    if (linkPolicy === "limited") {
      setMaxViews((v) => (v != null && v >= 1 ? v : 3));
    }
  }, [linkPolicy]);

  const canCreateLink =
    linkPolicy === "permanent" ||
    (linkPolicy === "expires" && expiresAt != null && expiresAt.isAfter(dayjs())) ||
    (linkPolicy === "limited" && maxViews != null && maxViews >= 1);

  const onCreateLink = async () => {
    if (!canCreateLink) return;
    setCreating(true);
    try {
      const body =
        linkPolicy === "permanent"
          ? { haikuId, expirationDate: null, maxViews: null }
          : linkPolicy === "expires"
            ? {
                haikuId,
                expirationDate: expiresAt!.toISOString(),
                maxViews: null,
              }
            : {
                haikuId,
                expirationDate: null,
                maxViews: maxViews!,
              };
      const data = await createShareLink(body);
      setCreatedUrl(data.shareUrl);
      message.success("Share link created");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { error?: string } | undefined)?.error;
        message.error(typeof msg === "string" ? msg : "Could not create share link");
      } else {
        message.error("Could not create share link");
      }
    } finally {
      setCreating(false);
    }
  };

  const onSendEmailPlaceholder = () => {
    message.info("Email sharing is not available yet.");
  };

  const onMethodChange = (e: RadioChangeEvent) => {
    setMethod(e.target.value);
    setCreatedUrl(null);
  };

  const onLinkPolicyChange = (e: RadioChangeEvent) => {
    setLinkPolicy(e.target.value);
    setCreatedUrl(null);
  };

  const footer =
    createdUrl != null ? (
      <Button type="primary" onClick={onClose}>
        Done
      </Button>
    ) : (
      <div className={styles.footerBtns}>
        <Button onClick={onClose}>Close</Button>
        <Button
          type="primary"
          loading={creating}
          disabled={method === "link" ? !canCreateLink : false}
          onClick={method === "link" ? onCreateLink : onSendEmailPlaceholder}
        >
          {method === "email" ? "Send" : "Create link"}
        </Button>
      </div>
    );

  return (
    <Modal
      title={createdUrl ? "Your share link" : "Share haiku"}
      open={open}
      onCancel={onClose}
      footer={footer}
      closable={false}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
      classNames={{ body: styles.modalBody, footer: styles.modalFooter }}
    >
      {createdUrl != null ? (
        <CopyText text={createdUrl} mode="link" />
      ) : (
        <>
          <Radio.Group
            value={method}
            onChange={onMethodChange}
            options={[
              { value: "link" as const, label: "Share by link" },
              { value: "email" as const, label: "Share via mail" },
            ]}
          />

          {method === "link" ? (
            <ShareLinkContent
              linkPolicy={linkPolicy}
              onLinkPolicyChange={onLinkPolicyChange}
              expiresAt={expiresAt}
              onExpiresAtChange={setExpiresAt}
              maxViews={maxViews}
              onMaxViewsChange={(v) => setMaxViews(typeof v === "number" ? v : null)}
            />
          ) : (
            <SendShareEmailContent />
          )}
        </>
      )}
    </Modal>
  );
}

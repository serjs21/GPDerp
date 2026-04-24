"use client";

import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { Button, Modal, Typography, message } from "@/components/StyledComponents";
import axios from "axios";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { deleteShareLink, refreshShareLink } from "@/api/shareLinks";
import { ShareLinkContent } from "@/components/ShareModal/ShareLinkContent";
import type { LinkPolicy } from "@/components/ShareModal/types";
import { getShareLinkStatus } from "@/utils/shareLinkStatus";
import styles from "./styles.module.css";

type ShareLinkEntryProps = {
  link: ShareLinkListItem;
  onChanged: () => void;
};

export function ShareLinkEntry({ link, onChanged }: ShareLinkEntryProps) {
  const status = useMemo(() => getShareLinkStatus(link), [link]);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [linkPolicy, setLinkPolicy] = useState<LinkPolicy>("permanent");
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);
  const [maxViews, setMaxViews] = useState<number | null>(3);

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteShareLink(link.id);
      message.success("Share link deleted");
      onChanged();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { error?: string } | undefined)?.error;
        message.error(typeof msg === "string" ? msg : "Could not delete share link");
      } else {
        message.error("Could not delete share link");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const openRefresh = () => {
    if (link.expirationDate) {
      const parsed = dayjs(link.expirationDate);
      const fallback = dayjs().add(1, "day");
      setLinkPolicy("expires");
      setExpiresAt(parsed.isAfter(dayjs()) ? parsed : fallback);
      setMaxViews(null);
    } else if (link.maxViews != null) {
      setLinkPolicy("limited");
      setMaxViews(Math.max(1, link.maxViews));
      setExpiresAt(null);
    } else {
      setLinkPolicy("permanent");
      setExpiresAt(null);
      setMaxViews(3);
    }
    setRefreshOpen(true);
  };

  const onRefresh = async () => {
    try {
      setIsRefreshing(true);
      const body =
        linkPolicy === "permanent"
          ? { expirationDate: null, maxViews: null }
          : linkPolicy === "expires"
            ? { expirationDate: expiresAt?.toISOString() ?? null, maxViews: null }
            : { expirationDate: null, maxViews: maxViews ?? null };
      await refreshShareLink(link.id, body);
      message.success("Share link refreshed");
      setRefreshOpen(false);
      onChanged();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { error?: string } | undefined)?.error;
        message.error(typeof msg === "string" ? msg : "Could not refresh share link");
      } else {
        message.error("Could not refresh share link");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const canRefresh =
    linkPolicy === "permanent" ||
    (linkPolicy === "expires" && expiresAt != null && expiresAt.isAfter(dayjs())) ||
    (linkPolicy === "limited" && maxViews != null && maxViews >= 1);

  const statusIcon = status.active ? (
    <CheckCircleTwoTone twoToneColor="#389e0d" />
  ) : (
    <CloseCircleTwoTone twoToneColor="#cf1322" />
  );

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <Typography.Title level={5} className={styles.subject}>
          {link.haikuSubject}
        </Typography.Title>
        <a href={link.shareUrl} target="_blank" rel="noreferrer" className={styles.url}>
          Open link
        </a>
      </header>

      <div className={styles.statusRow}>
        <span className={styles.statusIcon}>{statusIcon}</span>
        <Typography.Text>
          {status.label}
          {status.detail ? `: ${status.detail}` : ""}
        </Typography.Text>
      </div>

      <div className={styles.actions}>
        <Button danger onClick={() => void onDelete()} loading={isDeleting}>
          Delete
        </Button>
        {!status.active ? (
          <Button type="primary" onClick={openRefresh}>
            Refresh
          </Button>
        ) : null}
      </div>

      <Modal
        title="Refresh share link"
        open={refreshOpen}
        onCancel={() => setRefreshOpen(false)}
        onOk={() => void onRefresh()}
        okText="Apply"
        confirmLoading={isRefreshing}
        okButtonProps={{ disabled: !canRefresh }}
        destroyOnHidden
      >
        <ShareLinkContent
          linkPolicy={linkPolicy}
          onLinkPolicyChange={(e) => setLinkPolicy(e.target.value)}
          expiresAt={expiresAt}
          onExpiresAtChange={setExpiresAt}
          maxViews={maxViews}
          onMaxViewsChange={(v) => setMaxViews(typeof v === "number" ? v : null)}
        />
      </Modal>
    </article>
  );
}

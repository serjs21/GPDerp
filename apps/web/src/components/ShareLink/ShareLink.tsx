"use client";

import axios from "axios";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { Checkbox } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import * as shareLinksApi from "@/api/shareLinks";
import { ComicButton } from "@/components/ComicButton/ComicButton";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { DatePicker, InputNumber } from "@/components/StyledComponents";
import { useCopy } from "@/hooks/useCopy";
import { useLocale } from "@/hooks/useLocale";
import {
  getHitsMeterDisplay,
  getTimeMeterDisplay,
  shouldTickShareLinkClock,
} from "@/utils/shareLinkDisplay";
import { canStartShareLink, isActiveShareLink } from "@/utils/shareLinkStatus";
import styles from "./ShareLink.module.css";

const PAPER_PLANE_SRC = "/share_modal/link/paper_plane.svg";
const START_ICON_SRC = "/share_modal/link/start.svg";
const PAUSE_ICON_SRC = "/share_modal/link/pause.svg";
const HEART_FILLED_SRC = "/share_modal/link/heart_filled.svg";
const HEART_SRC = "/share_modal/link/heart.svg";
const CLOCK_SRC = "/share_modal/link/clock.svg";
const INFINITY_SRC = "/share_modal/link/infinity.svg";

const ACTIVATING_DOT_MS = 500;
const ACTIVATING_DOT_CYCLE = ["", ".", "..", "..."] as const;
const ACTIVATING_MIN_MS = ACTIVATING_DOT_MS * ACTIVATING_DOT_CYCLE.length;
const DEFAULT_HITS = 3;

type LimitForm = {
  hitsUnlimited: boolean;
  maxViews: number | null;
  timeoutUnlimited: boolean;
  expiresAt: Dayjs | null;
};

const defaultLimitForm = (): LimitForm => ({
  hitsUnlimited: true,
  maxViews: null,
  timeoutUnlimited: true,
  expiresAt: null,
});

const formFromLink = (link: ShareLinkListItem | null): LimitForm => {
  if (!link) return defaultLimitForm();
  return {
    hitsUnlimited: link.maxViews == null,
    maxViews: link.maxViews,
    timeoutUnlimited: link.expirationDate == null,
    expiresAt: link.expirationDate ? dayjs(link.expirationDate) : null,
  };
};

export const buildLimitPayload = (form: LimitForm): {
  maxViews: number | null;
  expirationDate: string | null;
} => {
  const maxViews =
    form.hitsUnlimited || form.maxViews == null || form.maxViews < 1
      ? null
      : Math.floor(form.maxViews);
  const expirationDate =
    form.timeoutUnlimited || form.expiresAt == null || !form.expiresAt.isValid()
      ? null
      : form.expiresAt.toISOString();
  return { maxViews, expirationDate };
};

const payloadDiffersFromLink = (
  link: ShareLinkListItem,
  payload: { maxViews: number | null; expirationDate: string | null },
) => {
  const linkExp = link.expirationDate;
  const nextExp = payload.expirationDate;
  const expChanged =
    (linkExp == null) !== (nextExp == null) ||
    (linkExp != null &&
      nextExp != null &&
      new Date(linkExp).getTime() !== new Date(nextExp).getTime());
  return link.maxViews !== payload.maxViews || expChanged;
};

export type ShareLinkProps = {
  link: ShareLinkListItem | null;
  haikuId: string;
  haikuSubject: string;
  onChanged: () => void;
  onLinkUpdate?: (link: ShareLinkListItem) => void;
  createShareLinkFn?: typeof shareLinksApi.createShareLink;
};

const getAxiosErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const msg = (error.response?.data as { error?: string } | undefined)?.error;
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

export function ShareLink({
  link,
  haikuId,
  haikuSubject,
  onChanged,
  onLinkUpdate,
  createShareLinkFn = shareLinksApi.createShareLink,
}: ShareLinkProps) {
  const reduceMotion = useReducedMotion();
  const { locale } = useLocale();
  const { copy } = useCopy();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activatingDots, setActivatingDots] = useState<(typeof ACTIVATING_DOT_CYCLE)[number]>("");
  const [now, setNow] = useState<Date | null>(null);
  const [form, setForm] = useState<LimitForm>(() => formFromLink(link));

  const subject = link?.haikuSubject || haikuSubject;
  const active = link != null && isActiveShareLink(link, now ?? undefined);
  const limitsLocked = active || activating;
  const copyEnabled = active && !activating;
  const isFlying = (active || activating) && !reduceMotion;
  const grayscale = !active;
  const shine = active || activating;

  const payload = buildLimitPayload(form);
  const formValid =
    (form.hitsUnlimited || (form.maxViews != null && form.maxViews >= 1)) &&
    (form.timeoutUnlimited ||
      (form.expiresAt != null && form.expiresAt.isValid() && form.expiresAt.isAfter(dayjs())));

  const statusSource: Pick<ShareLinkListItem, "maxViews" | "viewCount" | "expirationDate"> =
    active && link
      ? link
      : {
          maxViews: payload.maxViews,
          viewCount: 0,
          expirationDate: payload.expirationDate,
        };
  const hits = getHitsMeterDisplay(statusSource);
  const time = getTimeMeterDisplay(statusSource.expirationDate, now, locale);

  useEffect(() => {
    setForm(formFromLink(link));
  }, [link]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const exp = active && link ? link.expirationDate : payload.expirationDate;
    if (!shouldTickShareLinkClock(exp, new Date())) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active, link, payload.expirationDate]);

  useEffect(() => {
    if (!activating) {
      setActivatingDots("");
      return;
    }
    setActivatingDots("");
    let step = 0;
    const id = window.setInterval(() => {
      step = (step + 1) % ACTIVATING_DOT_CYCLE.length;
      setActivatingDots(ACTIVATING_DOT_CYCLE[step]!);
    }, ACTIVATING_DOT_MS);
    return () => window.clearInterval(id);
  }, [activating]);

  const finishActivating = async (startedAt: number) => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < ACTIVATING_MIN_MS) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, ACTIVATING_MIN_MS - elapsed);
      });
    }
    setActivating(false);
  };

  const onStop = async () => {
    if (!link || !active || isUpdating || activating) return;
    try {
      setIsUpdating(true);
      const updated = await shareLinksApi.setShareLinkDisabled(link.id, true);
      onLinkUpdate?.(updated);
      comicToast.success("Share link stopped");
      onChanged();
    } catch (error: unknown) {
      comicToast.error(getAxiosErrorMessage(error, "Could not stop share link"));
    } finally {
      setIsUpdating(false);
    }
  };

  const onStart = async () => {
    if (active || isUpdating || activating || !formValid) return;
    const startedAt = Date.now();
    setActivating(true);
    setIsUpdating(true);
    const limitPayload = buildLimitPayload(form);
    try {
      if (link == null) {
        const created = await createShareLinkFn({
          haikuId,
          expirationDate: limitPayload.expirationDate,
          maxViews: limitPayload.maxViews,
        });
        const next: ShareLinkListItem = {
          id: created.id,
          shareHash: created.shareHash,
          shareUrl: created.shareUrl,
          haikuSubject: created.haikuSubject || haikuSubject,
          sharedHaikuId: created.sharedHaikuId,
          createdAt: created.createdAt,
          expirationDate: created.expirationDate,
          maxViews: created.maxViews,
          viewCount: created.viewCount,
          disabled: created.disabled,
        };
        onLinkUpdate?.(next);
      } else {
        const needsRefresh =
          payloadDiffersFromLink(link, limitPayload) || !canStartShareLink(link, now ?? undefined);
        let current = link;
        if (needsRefresh) {
          current = await shareLinksApi.refreshShareLink(link.id, limitPayload);
          onLinkUpdate?.(current);
        }
        const updated = await shareLinksApi.setShareLinkDisabled(current.id, false);
        onLinkUpdate?.(updated);
      }
      comicToast.success("Share link started");
      onChanged();
    } catch (error: unknown) {
      comicToast.error(getAxiosErrorMessage(error, "Could not start share link"));
    } finally {
      setIsUpdating(false);
      await finishActivating(startedAt);
    }
  };

  const onCopy = () => {
    if (!copyEnabled || !link) return;
    void copy(link.shareUrl);
  };

  const hitsLabel =
    hits.kind === "unlimited"
      ? "Unlimited visits"
      : hits.kind === "empty"
        ? "No visits left"
        : `${hits.count} visits left`;
  const timeLabel =
    time.kind === "unlimited"
      ? "No expiration"
      : time.kind === "relative"
        ? `Expires ${time.text}`
        : time.text
          ? `Time left ${time.text}`
          : "Time left";

  const onHitsUnlimitedChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setForm((prev) => ({
      ...prev,
      hitsUnlimited: checked,
      maxViews: checked ? null : (prev.maxViews != null && prev.maxViews >= 1 ? prev.maxViews : DEFAULT_HITS),
    }));
  };

  const onTimeoutUnlimitedChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setForm((prev) => ({
      ...prev,
      timeoutUnlimited: checked,
      expiresAt: checked ? null : prev.expiresAt ?? dayjs().add(1, "day").endOf("day"),
    }));
  };

  return (
    <article className={styles.root}>
      <div
        className={[
          styles.panelShell,
          grayscale ? styles.panelShellInactive : styles.panelShellActive,
        ].join(" ")}
      >
        <ComicPagePanel
          span="full"
          background="sunburst"
          color={active && !activating ? "teal" : "white"}
          shine={shine}
          contentAlign="center"
          className={styles.panel}
          title={subject}
          ariaLabel={`Share link for ${subject}`}
        >
          <div className={styles.panelBody}>
            <div className={styles.planeStage}>
              <motion.img
                src={PAPER_PLANE_SRC}
                alt=""
                className={styles.plane}
                aria-hidden
                animate={
                  isFlying
                    ? {
                        x: [0, 3, -2, 4, 1, 0],
                        y: [0, -4, -7, -5, -2, 0],
                        rotate: [0, -5, 4, -3, 2, 0],
                      }
                    : {
                        x: 0,
                        y: 10,
                        rotate: 78,
                      }
                }
                transition={
                  isFlying
                    ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3, ease: "easeOut" }
                }
              />
            </div>

            <div className={styles.meters} aria-hidden={false}>
              <span className={styles.meter} aria-label={hitsLabel}>
                <img
                  src={hits.kind === "empty" ? HEART_SRC : HEART_FILLED_SRC}
                  alt=""
                  className={styles.meterIcon}
                  aria-hidden
                />
                {hits.kind === "unlimited" ? (
                  <img src={INFINITY_SRC} alt="" className={styles.meterIcon} aria-hidden />
                ) : (
                  <span className={styles.meterValue}>{hits.count}</span>
                )}
              </span>
              <span className={styles.meter} aria-label={timeLabel}>
                <img src={CLOCK_SRC} alt="" className={styles.meterIcon} aria-hidden />
                {time.kind === "unlimited" ? (
                  <img src={INFINITY_SRC} alt="" className={styles.meterIcon} aria-hidden />
                ) : (
                  <span className={styles.meterValue}>{time.text}</span>
                )}
              </span>
            </div>

            <motion.div
              className={styles.copyWrap}
              animate={{ opacity: copyEnabled ? 1 : 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.35, ease: "easeInOut" }
              }
              style={{ pointerEvents: copyEnabled ? "auto" : "none" }}
              aria-hidden={!copyEnabled}
            >
              <ComicButton
                bubbleStyle="speech"
                sourceDirection="none"
                disabled={!copyEnabled}
                onClick={onCopy}
                className={styles.copyBubble}
              >
                Copy share link
              </ComicButton>
            </motion.div>
          </div>
        </ComicPagePanel>
      </div>

      <div className={styles.limitsRow}>
        <label className={styles.limitField}>
          <span className={styles.limitLabel}>Hits</span>
          <InputNumber
            min={1}
            step={1}
            precision={0}
            value={form.hitsUnlimited ? null : form.maxViews}
            disabled={limitsLocked || form.hitsUnlimited}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                maxViews: typeof v === "number" ? v : null,
              }))
            }
            className={styles.limitInput}
          />
          <Checkbox
            checked={form.hitsUnlimited}
            disabled={limitsLocked}
            onChange={onHitsUnlimitedChange}
          >
            unlimited
          </Checkbox>
        </label>

        <label className={styles.limitField}>
          <span className={styles.limitLabel}>Timeout</span>
          <DatePicker
            showTime
            value={form.timeoutUnlimited ? null : form.expiresAt}
            disabled={limitsLocked || form.timeoutUnlimited}
            disabledDate={(d) => d != null && d.isBefore(dayjs(), "day")}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                expiresAt: v,
              }))
            }
            className={styles.limitDate}
          />
          <Checkbox
            checked={form.timeoutUnlimited}
            disabled={limitsLocked}
            onChange={onTimeoutUnlimitedChange}
          >
            unlimited
          </Checkbox>
        </label>
      </div>

      <div className={styles.actionRow}>
        {activating ? (
          <button type="button" className={styles.actionButton} disabled aria-live="polite">
            <span className={styles.actionLabel}>
              Activating
              <span className={styles.activatingDots}>{activatingDots}</span>
            </span>
          </button>
        ) : active ? (
          <button
            type="button"
            className={styles.actionButton}
            disabled={isUpdating}
            onClick={() => void onStop()}
            aria-label="Stop link"
          >
            <img src={PAUSE_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
            <span className={styles.actionLabel}>Stop</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.actionButton}
            disabled={!formValid || isUpdating}
            onClick={() => void onStart()}
            aria-label="Start link"
          >
            <img src={START_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
            <span className={styles.actionLabel}>Start</span>
          </button>
        )}
      </div>
    </article>
  );
}

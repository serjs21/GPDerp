"use client";

import axios from "axios";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import * as shareLinksApi from "@/api/shareLinks";
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
const UPDATE_ICON_SRC = "/share_modal/link/update.svg";
const HEART_FILLED_SRC = "/share_modal/link/heart_filled.svg";
const HEART_SRC = "/share_modal/link/heart.svg";
const CLOCK_SRC = "/share_modal/link/clock.svg";
const INFINITY_SRC = "/share_modal/link/infinity.svg";

const ACTIVATING_DOT_MS = 500;
const ACTIVATING_DOT_CYCLE = ["", ".", "..", "..."] as const;
const ACTIVATING_MIN_MS = ACTIVATING_DOT_MS * ACTIVATING_DOT_CYCLE.length;
const PLANE_ALTITUDE_Y = -50;
const PLANE_LIFT_MS = 0.4;

type PlanePhase = "idle" | "takeoff" | "flying" | "landing";

const planeVariants: Record<
  PlanePhase,
  {
    x: number | number[];
    y: number | number[];
    rotate: number | number[];
    transition: {
      duration: number;
      ease?: "easeOut" | "easeInOut";
      repeat?: number;
    };
  }
> = {
  idle: {
    x: 0,
    y: 0,
    rotate: 78,
    transition: { duration: 0 },
  },
  takeoff: {
    x: 0,
    y: PLANE_ALTITUDE_Y,
    rotate: 0,
    transition: { duration: PLANE_LIFT_MS, ease: "easeOut" },
  },
  flying: {
    x: [0, 3, -2, 4, 1, 0],
    y: [
      PLANE_ALTITUDE_Y,
      PLANE_ALTITUDE_Y - 4,
      PLANE_ALTITUDE_Y - 7,
      PLANE_ALTITUDE_Y - 5,
      PLANE_ALTITUDE_Y - 2,
      PLANE_ALTITUDE_Y,
    ],
    rotate: [0, -5, 4, -3, 2, 0],
    transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
  },
  landing: {
    x: 0,
    y: 0,
    rotate: 78,
    transition: { duration: PLANE_LIFT_MS, ease: "easeOut" },
  },
};

type LimitForm = {
  maxViews: number | null;
  expiresAt: Dayjs | null;
};

const defaultLimitForm = (): LimitForm => ({
  maxViews: null,
  expiresAt: null,
});

const formFromLink = (link: ShareLinkListItem | null): LimitForm => {
  if (!link) return defaultLimitForm();
  return {
    maxViews: link.maxViews,
    expiresAt: link.expirationDate ? dayjs(link.expirationDate) : null,
  };
};

export const buildLimitPayload = (form: LimitForm): {
  maxViews: number | null;
  expirationDate: string | null;
} => {
  const maxViews =
    form.maxViews == null || form.maxViews < 1 ? null : Math.floor(form.maxViews);
  const expirationDate =
    form.expiresAt == null || !form.expiresAt.isValid() ? null : form.expiresAt.toISOString();
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
  refreshShareLinkFn?: typeof shareLinksApi.refreshShareLink;
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
  refreshShareLinkFn = shareLinksApi.refreshShareLink,
}: ShareLinkProps) {
  const reduceMotion = useReducedMotion();
  const { locale } = useLocale();
  const { copy } = useCopy();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [updatingLimits, setUpdatingLimits] = useState(false);
  const [busyDots, setBusyDots] = useState<(typeof ACTIVATING_DOT_CYCLE)[number]>("");
  const [now, setNow] = useState<Date | null>(null);
  const [form, setForm] = useState<LimitForm>(() => formFromLink(link));

  const subject = link?.haikuSubject || haikuSubject;
  const active = link != null && isActiveShareLink(link, now ?? undefined);
  const busy = activating || deactivating || updatingLimits;
  const limitsLocked = busy;
  const copyEnabled = active && !busy;
  const grayscale = !active && !deactivating;
  const shine = active || activating || deactivating;
  const planePhase: PlanePhase = reduceMotion
    ? "idle"
    : deactivating
      ? "landing"
      : activating
        ? "takeoff"
        : active
          ? "flying"
          : "idle";
  /** Static airborne pose so mount-as-active can enter the flying keyframe loop. */
  const planeInitial =
    active && !reduceMotion
      ? { x: 0, y: PLANE_ALTITUDE_Y, rotate: 0 }
      : ("idle" as const);

  const payload = buildLimitPayload(form);
  const formValid =
    (form.maxViews == null || form.maxViews >= 1) &&
    (form.expiresAt == null ||
      (form.expiresAt.isValid() && form.expiresAt.isAfter(dayjs())));
  const limitsDirty = link != null && payloadDiffersFromLink(link, payload);
  const showUpdate = active && (limitsDirty || updatingLimits);

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
    if (!busy) {
      setBusyDots("");
      return;
    }
    setBusyDots("");
    let step = 0;
    const id = window.setInterval(() => {
      step = (step + 1) % ACTIVATING_DOT_CYCLE.length;
      setBusyDots(ACTIVATING_DOT_CYCLE[step]!);
    }, ACTIVATING_DOT_MS);
    return () => window.clearInterval(id);
  }, [busy]);

  const holdMinBusy = async (startedAt: number, minMs = ACTIVATING_MIN_MS) => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < minMs) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, minMs - elapsed);
      });
    }
  };

  const onStop = async () => {
    if (!link || !active || isUpdating || busy) return;
    const startedAt = Date.now();
    setDeactivating(true);
    setIsUpdating(true);
    try {
      const updated = await shareLinksApi.setShareLinkDisabled(link.id, true);
      onLinkUpdate?.(updated);
      comicToast.success("Share link stopped");
      onChanged();
    } catch (error: unknown) {
      comicToast.error(getAxiosErrorMessage(error, "Could not stop share link"));
    } finally {
      setIsUpdating(false);
      await holdMinBusy(startedAt, Math.round(PLANE_LIFT_MS * 1000));
      setDeactivating(false);
    }
  };

  const onStart = async () => {
    if (active || isUpdating || busy || !formValid) return;
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
          current = await refreshShareLinkFn(link.id, limitPayload);
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
      await holdMinBusy(startedAt);
      setActivating(false);
    }
  };

  const onUpdateLimits = async () => {
    if (!link || !active || !limitsDirty || isUpdating || busy || !formValid) return;
    const startedAt = Date.now();
    setUpdatingLimits(true);
    setIsUpdating(true);
    try {
      const updated = await refreshShareLinkFn(link.id, buildLimitPayload(form));
      onLinkUpdate?.(updated);
      comicToast.success("Share link updated");
      onChanged();
    } catch (error: unknown) {
      comicToast.error(getAxiosErrorMessage(error, "Could not update share link"));
    } finally {
      setIsUpdating(false);
      await holdMinBusy(startedAt);
      setUpdatingLimits(false);
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

  const panelBodyClass = [
    styles.panelBody,
    copyEnabled ? styles.panelBodyCopyable : null,
  ]
    .filter(Boolean)
    .join(" ");

  const panelBodyContent = (
    <>
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
      <div className={styles.planeStage}>
        <motion.img
          src={PAPER_PLANE_SRC}
          alt=""
          className={styles.plane}
          aria-hidden
          variants={planeVariants}
          initial={planeInitial}
          animate={planePhase}
        />
      </div>
    </>
  );

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
          sunburstHalftone={false}
          color={active && !activating && !deactivating ? "orange" : "white"}
          shine={shine}
          contentAlign="center"
          className={styles.panel}
          title={subject}
          footer={copyEnabled ? "Click to copy the link" : undefined}
          footerColor="info"
          ariaLabel={`Share link for ${subject}`}
        >
          {copyEnabled ? (
            <button
              type="button"
              className={panelBodyClass}
              onClick={onCopy}
              aria-label="Copy share link"
            >
              {panelBodyContent}
            </button>
          ) : (
            <div className={panelBodyClass}>{panelBodyContent}</div>
          )}
        </ComicPagePanel>
      </div>

      <div className={styles.limitsRow}>
        <div className={styles.limitFields}>
          <label className={styles.limitField}>
            <span className={styles.limitLabel}>Hits</span>
            <span className={styles.limitControl}>
              <InputNumber
                min={1}
                step={1}
                precision={0}
                placeholder="∞"
                value={form.maxViews}
                disabled={limitsLocked}
                onChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    maxViews: typeof v === "number" ? v : null,
                  }))
                }
                className={styles.limitInput}
              />
            </span>
          </label>

          <label className={styles.limitField}>
            <span className={styles.limitLabel}>Timeout</span>
            <span className={styles.limitControl}>
              <DatePicker
                showTime
                allowClear
                placeholder="∞"
                value={form.expiresAt}
                disabled={limitsLocked}
                disabledDate={(d) => d != null && d.isBefore(dayjs(), "day")}
                onChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    expiresAt: v,
                  }))
                }
                className={styles.limitDate}
              />
            </span>
          </label>
        </div>

        {showUpdate ? (
          <button
            type="button"
            className={styles.updateButton}
            disabled={!formValid || isUpdating || busy}
            onClick={() => void onUpdateLimits()}
            aria-label="Update link"
            aria-live="polite"
          >
            {updatingLimits ? (
              <span className={styles.actionLabel}>
                Updating
                <span className={styles.activatingDots}>{busyDots}</span>
              </span>
            ) : (
              <>
                <img src={UPDATE_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
                <span className={styles.actionLabel}>Update</span>
              </>
            )}
          </button>
        ) : null}
      </div>

      <div className={styles.actionRow}>
        {activating ? (
          <button type="button" className={styles.actionButton} disabled aria-live="polite">
            <span className={styles.actionLabel}>
              Activating
              <span className={styles.activatingDots}>{busyDots}</span>
            </span>
          </button>
        ) : deactivating ? (
          <button type="button" className={styles.actionButton} disabled aria-live="polite">
            <span className={styles.actionLabel}>
              Stopping
              <span className={styles.activatingDots}>{busyDots}</span>
            </span>
          </button>
        ) : active ? (
          <button
            type="button"
            className={styles.actionButton}
            disabled={isUpdating || busy}
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
            disabled={!formValid || isUpdating || busy}
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

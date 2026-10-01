"use client";

import axios from "axios";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import * as shareLinksApi from "@/api/shareLinks";
import { comicToast } from "@/components/ComicToast";
import { useCopy } from "@/hooks/useCopy";
import { useLocale } from "@/hooks/useLocale";
import {
  getHitsMeterDisplay,
  getTimeMeterDisplay,
  shouldTickShareLinkClock,
} from "@/utils/shareLinkDisplay";
import { canStartShareLink, getRestartReason, isActiveShareLink, isExpired, isViewLimitReached } from "@/utils/shareLinkStatus";

export const PAPER_PLANE_SRC = "/share_modal/link/paper_plane.svg";
export const START_ICON_SRC = "/share_link_actions/start.svg";
export const PAUSE_ICON_SRC = "/share_link_actions/stop.svg";
export const UPDATE_ICON_SRC = "/share_modal/link/update.svg";
export const HEART_FILLED_SRC = "/share_modal/link/heart_filled.svg";
export const HEART_SRC = "/share_modal/link/heart.svg";
export const CLOCK_SRC = "/share_modal/link/clock.svg";
export const INFINITY_SRC = "/share_modal/link/infinity.svg";

export const ACTIVATING_DOT_MS = 500;
export const ACTIVATING_DOT_CYCLE = ["", ".", "..", "..."] as const;
export const ACTIVATING_MIN_MS = ACTIVATING_DOT_MS * ACTIVATING_DOT_CYCLE.length;
export const PLANE_ALTITUDE_Y = -50;
export const PLANE_LIFT_MS = 0.4;

export type PlanePhase = "idle" | "takeoff" | "flying" | "landing";

export const planeVariants: Record<
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

export type LimitForm = {
  maxViews: number | null;
  expiresAt: Dayjs | null;
};

const defaultLimitForm = (): LimitForm => ({
  maxViews: null,
  expiresAt: null,
});

export const formFromLink = (link: ShareLinkListItem | null): LimitForm => {
  if (!link) return defaultLimitForm();
  const reason = link.deactivationReason;
  const shouldClearLimits =
    reason === "timeout" ||
    reason === "limit_reached" ||
    (!isActiveShareLink(link) && (isExpired(link) || isViewLimitReached(link)));
  if (shouldClearLimits) return defaultLimitForm();
  return {
    maxViews: link.maxViews,
    expiresAt: link.expirationDate ? dayjs(link.expirationDate) : null,
  };
};

export const buildLimitPayload = (
  form: LimitForm,
): {
  maxViews: number | null;
  expirationDate: string | null;
} => {
  const maxViews =
    form.maxViews == null || form.maxViews < 1 ? null : Math.floor(form.maxViews);
  const expirationDate =
    form.expiresAt == null || !form.expiresAt.isValid() ? null : form.expiresAt.toISOString();
  return { maxViews, expirationDate };
};

export const payloadDiffersFromLink = (
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

const getAxiosErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const msg = (error.response?.data as { error?: string } | undefined)?.error;
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

export type UseShareLinkControlsArgs = {
  link: ShareLinkListItem | null;
  haikuId: string;
  haikuSubject: string;
  onChanged: () => void;
  onLinkUpdate?: (link: ShareLinkListItem) => void;
  createShareLinkFn?: typeof shareLinksApi.createShareLink;
  refreshShareLinkFn?: typeof shareLinksApi.refreshShareLink;
};

/** Shared start/stop/limits state for ShareLink + ShareLinkManagement. */
// eslint-disable-next-line max-lines-per-function, complexity -- intentional single control surface
export function useShareLinkControls({
  link,
  haikuId,
  haikuSubject,
  onChanged,
  onLinkUpdate,
  createShareLinkFn = shareLinksApi.createShareLink,
  refreshShareLinkFn = shareLinksApi.refreshShareLink,
}: UseShareLinkControlsArgs) {
  const reduceMotion = useReducedMotion();
  const { locale } = useLocale();
  const { copy } = useCopy();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [updatingLimits, setUpdatingLimits] = useState(false);
  const [togglingLabels, setTogglingLabels] = useState(false);
  const [busyDots, setBusyDots] = useState<(typeof ACTIVATING_DOT_CYCLE)[number]>("");
  const [now, setNow] = useState<Date | null>(null);
  const [form, setForm] = useState<LimitForm>(() => formFromLink(link));

  const subject = link?.haikuSubject || haikuSubject;
  const active = link != null && isActiveShareLink(link, now ?? undefined);
  const restartReason = getRestartReason(link, now ?? undefined);
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
  const planeInitial =
    active && !reduceMotion
      ? { x: 0, y: PLANE_ALTITUDE_Y, rotate: 0 }
      : ("idle" as const);

  const payload = buildLimitPayload(form);
  const formValid =
    (form.maxViews == null || form.maxViews >= 1) &&
    (form.expiresAt == null ||
      (form.expiresAt.isValid() &&
        !form.expiresAt.isBefore(dayjs().add(1, "minute"))));
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

  // eslint-disable-next-line complexity -- create vs refresh vs enable paths
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
          showLabels: created.showLabels,
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

  const onToggleLabels = async (next: boolean = !link?.showLabels) => {
    if (!link || togglingLabels) return;
    setTogglingLabels(true);
    try {
      const updated = await shareLinksApi.setShareLinkShowLabels(link.id, next);
      onLinkUpdate?.(updated);
      onChanged();
    } catch (error: unknown) {
      comicToast.error(getAxiosErrorMessage(error, "Could not update label visibility"));
    } finally {
      setTogglingLabels(false);
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
      : time.text
        ? `Time left ${time.text}`
        : "Time left";

  return {
    subject,
    active,
    restartReason,
    busy,
    limitsLocked,
    copyEnabled,
    grayscale,
    shine,
    planePhase,
    planeInitial,
    form,
    setForm,
    formValid,
    showUpdate,
    hits,
    time,
    hitsLabel,
    timeLabel,
    busyDots,
    isUpdating,
    activating,
    deactivating,
    updatingLimits,
    togglingLabels,
    onStop,
    onStart,
    onUpdateLimits,
    onToggleLabels,
    onCopy,
  };
}

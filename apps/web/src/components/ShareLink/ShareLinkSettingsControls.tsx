"use client";

import dayjs from "dayjs";
import type { Dispatch, SetStateAction } from "react";
import { ComicPressButton } from "@/components/ComicPressButton";
import { DatePicker, InputNumber } from "@/components/StyledComponents";
import type { RestartLinkReason } from "@/components/RestartLinkButton";
import styles from "./ShareLink.module.css";
import limitStyles from "./ShareLinkLimitFields.module.css";
import { ShareLinkLifecycleAction } from "./ShareLinkLifecycleAction";
import { UPDATE_ICON_SRC, type LimitForm } from "./useShareLinkControls";

export type ShareLinkSettingsControlsProps = {
  form: LimitForm;
  setForm: Dispatch<SetStateAction<LimitForm>>;
  limitsLocked: boolean;
  formValid: boolean;
  showUpdate: boolean;
  updatingLimits: boolean;
  activating: boolean;
  deactivating: boolean;
  active: boolean;
  busy: boolean;
  isUpdating: boolean;
  busyDots: string;
  onUpdateLimits: () => void | Promise<void>;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  stopButtonClassName?: string;
  restartReason?: RestartLinkReason | null;
  /** Omit the inline Update button (e.g. when a ShareLinkActions column owns it). */
  hideUpdate?: boolean;
  /** Omit Launch/Stop/Restart (e.g. when the parent renders ShareLinkLifecycleAction elsewhere). */
  hideLifecycleAction?: boolean;
};

function minTimeoutAt() {
  return dayjs().add(1, "minute");
}

function rangeInts(end: number) {
  return Array.from({ length: end }, (_, i) => i);
}

function disabledTimeoutTime(date: dayjs.Dayjs | null) {
  const min = minTimeoutAt();
  if (date == null || !date.isSame(min, "day")) {
    return {};
  }

  const minHour = min.hour();
  const minMinute = min.minute();
  const minSecond = min.second();

  return {
    disabledHours: () => rangeInts(minHour),
    disabledMinutes: (hour: number) => {
      if (hour < minHour) return rangeInts(60);
      if (hour === minHour) return rangeInts(minMinute);
      return [];
    },
    disabledSeconds: (hour: number, minute: number) => {
      if (hour < minHour || (hour === minHour && minute < minMinute)) {
        return rangeInts(60);
      }
      if (hour === minHour && minute === minMinute) {
        return rangeInts(minSecond);
      }
      return [];
    },
  };
}

function clampTimeout(value: dayjs.Dayjs | null) {
  if (value == null || !value.isValid()) return value;
  const min = minTimeoutAt();
  return value.isBefore(min) ? min : value;
}

export function ShareLinkSettingsControls({
  form,
  setForm,
  limitsLocked,
  formValid,
  showUpdate,
  updatingLimits,
  activating,
  deactivating,
  active,
  busy,
  isUpdating,
  busyDots,
  onUpdateLimits,
  onStart,
  onStop,
  stopButtonClassName,
  restartReason = null,
  hideUpdate = false,
  hideLifecycleAction = false,
}: ShareLinkSettingsControlsProps) {
  return (
    <>
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
                className={[styles.limitInput, limitStyles.comicField].join(" ")}
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
                minDate={minTimeoutAt()}
                disabledDate={(d) =>
                  d != null && d.endOf("day").isBefore(minTimeoutAt())
                }
                disabledTime={disabledTimeoutTime}
                onChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    expiresAt: clampTimeout(v),
                  }))
                }
                className={[styles.limitDate, limitStyles.comicField].join(" ")}
                classNames={{ popup: { root: limitStyles.datePopup } }}
              />
            </span>
          </label>
        </div>

        {showUpdate && !hideUpdate ? (
          <ComicPressButton
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
                {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
                <img src={UPDATE_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
                <span className={styles.actionLabel}>Update</span>
              </>
            )}
          </ComicPressButton>
        ) : null}
      </div>

      {hideLifecycleAction ? null : (
        <ShareLinkLifecycleAction
          formValid={formValid}
          activating={activating}
          deactivating={deactivating}
          active={active}
          busy={busy}
          isUpdating={isUpdating}
          busyDots={busyDots}
          onStart={onStart}
          onStop={onStop}
          stopButtonClassName={stopButtonClassName}
          restartReason={restartReason}
        />
      )}
    </>
  );
}

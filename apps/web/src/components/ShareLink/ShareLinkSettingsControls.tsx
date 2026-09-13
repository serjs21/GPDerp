"use client";

import dayjs from "dayjs";
import type { Dispatch, SetStateAction } from "react";
import { DatePicker, InputNumber } from "@/components/StyledComponents";
import styles from "./ShareLink.module.css";
import {
  PAUSE_ICON_SRC,
  START_ICON_SRC,
  UPDATE_ICON_SRC,
  type LimitForm,
} from "./useShareLinkControls";

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
};

// eslint-disable-next-line max-lines-per-function -- mirrors share modal settings chrome
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
                {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
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
            className={[styles.actionButton, stopButtonClassName].filter(Boolean).join(" ")}
            disabled={isUpdating || busy}
            onClick={() => void onStop()}
            aria-label="Stop link"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
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
            {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
            <img src={START_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
            <span className={styles.actionLabel}>Start</span>
          </button>
        )}
      </div>
    </>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { DatePicker, InputNumber } from "@/components/StyledComponents";
import type { ShareLinkLimitInputsProps } from "./ShareLinkLimitInputs.types";
import styles from "./ShareLink.module.css";
import limitStyles from "./ShareLinkLimitFields.module.css";
import {
  clampTimeout,
  disabledTimeoutTime,
  isTimeoutDateDisabled,
  maxViewsFromInput,
  minTimeoutAt,
} from "./utils/shareLinkTimeoutUtils";

/** Hits-limit and timeout fields for a share link. */
export function ShareLinkLimitInputs({ form, setForm, limitsLocked }: ShareLinkLimitInputsProps) {
  const t = useTranslations("ShareLink.settings");
  return (
    <div className={styles.limitFields}>
      <label className={styles.limitField}>
        <span className={styles.limitLabel}>{t("hitsLimit")}</span>
        <span className={styles.limitControl}>
          <InputNumber
            min={1}
            step={1}
            precision={0}
            placeholder="∞"
            value={form.maxViews}
            disabled={limitsLocked}
            onChange={(v) => setForm((prev) => ({ ...prev, maxViews: maxViewsFromInput(v) }))}
            className={[styles.limitInput, limitStyles.comicField].join(" ")}
          />
        </span>
      </label>

      <label className={styles.limitField}>
        <span className={styles.limitLabel}>{t("timeoutAt")}</span>
        <span className={styles.limitControl}>
          <DatePicker
            showTime
            allowClear
            placeholder={t("timeoutPlaceholder")}
            value={form.expiresAt}
            disabled={limitsLocked}
            minDate={minTimeoutAt()}
            disabledDate={isTimeoutDateDisabled}
            disabledTime={disabledTimeoutTime}
            onChange={(v) => setForm((prev) => ({ ...prev, expiresAt: clampTimeout(v) }))}
            className={[styles.limitDate, limitStyles.comicField].join(" ")}
            classNames={{ popup: { root: limitStyles.datePopup } }}
          />
        </span>
      </label>
    </div>
  );
}

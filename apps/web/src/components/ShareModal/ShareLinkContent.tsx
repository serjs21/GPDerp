"use client";

import { DatePicker, InputNumber, Radio, Typography } from "antd";
import type { RadioChangeEvent } from "antd/es/radio";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { LinkPolicy } from "./types";
import styles from "./ShareLinkContent.module.css";

export type ShareLinkContentProps = {
  linkPolicy: LinkPolicy;
  onLinkPolicyChange: (e: RadioChangeEvent) => void;
  expiresAt: Dayjs | null;
  onExpiresAtChange: (v: Dayjs | null) => void;
  maxViews: number | null;
  onMaxViewsChange: (v: number | null) => void;
};

export const ShareLinkContent = ({
  linkPolicy,
  onLinkPolicyChange,
  expiresAt,
  onExpiresAtChange,
  maxViews,
  onMaxViewsChange,
}: ShareLinkContentProps) => (
  <div className={styles.section}>
    <Typography.Text type="secondary">Link settings</Typography.Text>
    <Radio.Group
      className={styles.linkOptions}
      value={linkPolicy}
      onChange={onLinkPolicyChange}
      options={[
        { value: "permanent" as const, label: "Permanent" },
        { value: "expires" as const, label: "Expires at" },
        { value: "limited" as const, label: "Limited views" },
      ]}
    />

    {linkPolicy === "expires" ? (
      <div className={styles.formControl}>
        <DatePicker
          showTime
          placeholder="Choose date and time"
          value={expiresAt}
          onChange={onExpiresAtChange}
          disabledDate={(d) => d.isBefore(dayjs(), "day")}
          disabledTime={(d) => {
            const now = dayjs();
            if (!d || d.isAfter(now, "day")) return {};
            return {
              disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
              disabledMinutes: (h: number) =>
                h === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : [],
              disabledSeconds: (h: number, m: number) =>
                h === now.hour() && m === now.minute()
                  ? Array.from({ length: now.second() }, (_, i) => i)
                  : [],
            };
          }}
        />
      </div>
    ) : null}

    {linkPolicy === "limited" ? (
      <div className={styles.formControl}>
        <InputNumber
          min={1}
          step={1}
          precision={0}
          value={maxViews ?? undefined}
          onChange={onMaxViewsChange}
          autoFocus
        />
      </div>
    ) : null}
  </div>
);

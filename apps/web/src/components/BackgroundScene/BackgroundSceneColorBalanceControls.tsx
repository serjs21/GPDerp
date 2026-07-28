"use client";

import {
  DEFAULT_COLOR_BALANCE,
  type ColorBalanceValues,
} from "./backgroundSceneColorBalance";
import styles from "./BackgroundSceneColorBalanceControls.module.css";

export type BackgroundSceneColorBalanceControlsProps = {
  value: ColorBalanceValues;
  onChange: (next: ColorBalanceValues) => void;
};

type BalanceField = keyof ColorBalanceValues;

const FIELDS: { key: BalanceField; label: string }[] = [
  { key: "cyanRed", label: "Cyan ↔ Red" },
  { key: "magentaGreen", label: "Magenta ↔ Green" },
  { key: "yellowBlue", label: "Yellow ↔ Blue" },
];

export function BackgroundSceneColorBalanceControls({
  value,
  onChange,
}: BackgroundSceneColorBalanceControlsProps) {
  const update = (key: BalanceField, next: number) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <div className={styles.panel}>
      <p className={styles.title}>Color balance</p>
      {FIELDS.map(({ key, label }) => (
        <label key={key} className={styles.field}>
          <span>
            {label}{" "}
            <span className={styles.value}>
              {value[key] > 0 ? "+" : ""}
              {value[key]}
            </span>
          </span>
          <input
            className={styles.slider}
            type="range"
            min={-100}
            max={100}
            step={1}
            value={value[key]}
            onChange={(event) => update(key, Number(event.target.value))}
          />
        </label>
      ))}
      <button
        type="button"
        className={styles.value}
        onClick={() => onChange(DEFAULT_COLOR_BALANCE)}
      >
        Reset balance
      </button>
    </div>
  );
}

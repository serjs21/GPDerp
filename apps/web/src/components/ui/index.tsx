"use client";

import type { ReactNode } from "react";
import styles from "./ui.module.css";

const cx = (...tokens: Array<string | false | null | undefined>) => tokens.filter(Boolean).join(" ");

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "tab";
  active?: boolean;
  loading?: boolean;
};

export const UIButton = ({
  variant = "default",
  active,
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={cx(
      "gp-ui-btn",
      styles.button,
      variant === "primary" && styles.buttonPrimary,
      variant === "danger" && styles.buttonDanger,
      variant === "tab" && styles.tab,
      active && styles.tabActive,
      loading && styles.buttonLoading,
      className,
    )}
  >
    {children}
  </button>
);

export const UICard = ({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={cx(styles.card, className)}>
    {title ? <header className={styles.cardHeader}>{title}</header> : null}
    <div className={styles.cardBody}>{children}</div>
  </section>
);

type UIFieldProps = {
  label?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
};

export const UIField = ({ label, htmlFor, children }: UIFieldProps) => (
  <label className={styles.field} htmlFor={htmlFor}>
    {label ? <span className={styles.label}>{label}</span> : null}
    {children}
  </label>
);

export const UIInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={cx(styles.input, props.className)} />;

type UISelectOption = { value: string; label: string };
type UISelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { options: UISelectOption[] };

export const UISelect = ({ options, ...props }: UISelectProps) => (
  <select {...props} className={cx(styles.select, props.className)}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export const UIStack = ({
  children,
  vertical = false,
  gap = 12,
  className,
  style,
}: {
  children: ReactNode;
  vertical?: boolean;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={cx(styles.stack, vertical && styles.stackVertical, className)} style={{ gap, ...style }}>
    {children}
  </div>
);

export const UIText = ({ children, muted, className }: { children: ReactNode; muted?: boolean; className?: string }) => (
  <p className={cx(muted && styles.muted, className)}>{children}</p>
);

export const UITabs = <TKey extends string>({
  items,
  activeKey,
  onChange,
}: {
  items: Array<{ key: TKey; label: ReactNode; children: ReactNode }>;
  activeKey: TKey;
  onChange: (key: TKey) => void;
}) => (
  <div className={styles.tabs}>
    <div className={styles.tabList}>
      {items.map((item) => (
        <UIButton key={item.key} variant="tab" active={item.key === activeKey} onClick={() => onChange(item.key)}>
          {item.label}
        </UIButton>
      ))}
    </div>
    <div>{items.find((item) => item.key === activeKey)?.children ?? null}</div>
  </div>
);

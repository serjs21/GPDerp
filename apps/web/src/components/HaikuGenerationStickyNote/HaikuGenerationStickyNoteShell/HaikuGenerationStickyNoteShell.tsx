"use client";

import type { ReactNode } from "react";
import styles from "./HaikuGenerationStickyNoteShell.module.css";

export type HaikuGenerationStickyNoteShellProps = {
  title?: ReactNode;
  meta?: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  rotate?: number;
};

export function HaikuGenerationStickyNoteShell({
  title,
  meta,
  body,
  actions,
  footer,
  children,
  className,
  rotate = -0.4,
}: HaikuGenerationStickyNoteShellProps) {
  const rootClass = [styles.shell, className].filter(Boolean).join(" ");

  return (
    <article
      className={rootClass}
      style={{ "--sticky-rotate": `${rotate}deg` } as React.CSSProperties}
    >
      <div className={styles.tape} aria-hidden />
      {actions ? <div className={styles.actions}>{actions}</div> : null}
      {title ? <div className={styles.title}>{title}</div> : null}
      {meta ? <div className={styles.meta}>{meta}</div> : null}
      {body ? <div className={styles.body}>{body}</div> : null}
      {children}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </article>
  );
}

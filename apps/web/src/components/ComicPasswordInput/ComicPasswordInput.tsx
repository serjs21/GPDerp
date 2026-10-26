"use client";

import { forwardRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ComicModalInput } from "@/components/ComicModalInput";
import { PASSWORD_HIDDEN_ICON_SRC, PASSWORD_VISIBLE_ICON_SRC } from "./consts/comicPasswordInputConsts";
import type { ComicPasswordInputProps } from "./ComicPasswordInput.types";
import styles from "./ComicPasswordInput.module.css";

/** ComicModalInput for passwords, with a button inside the field that shows or hides the typed text. */
export const ComicPasswordInput = forwardRef<HTMLInputElement, ComicPasswordInputProps>(function ComicPasswordInput(
  { className, ...props },
  ref,
) {
  const t = useTranslations("ComicPasswordInput");
  const [visible, setVisible] = useState(false);

  return (
    <span className={styles.root}>
      <ComicModalInput
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        className={[styles.input, className].filter(Boolean).join(" ")}
      />
      <button
        type="button"
        className={styles.toggle}
        aria-label={t(visible ? "hide" : "show")}
        aria-pressed={visible}
        // Keep focus (and the caret) in the field while toggling.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setVisible((current) => !current)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.icon}
          src={visible ? PASSWORD_VISIBLE_ICON_SRC : PASSWORD_HIDDEN_ICON_SRC}
          alt=""
          aria-hidden
          draggable={false}
        />
      </button>
    </span>
  );
});

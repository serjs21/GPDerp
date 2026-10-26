"use client";

import { forwardRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ComicModalInput } from "@/components/ComicModalInput";
import { usePasswordClaps } from "@/hooks/usePasswordClaps";
import { PASSWORD_HIDDEN_ICON_SRC, PASSWORD_VISIBLE_ICON_SRC } from "./consts/comicPasswordInputConsts";
import type { ComicPasswordInputProps } from "./ComicPasswordInput.types";
import { PasswordClapBursts } from "./PasswordClapBursts";
import styles from "./ComicPasswordInput.module.css";

/**
 * ComicModalInput for passwords, with a button inside the field that shows or hides the typed text.
 * Each toggle pops a clap sound effect centre-left of the icon in a random colour, spot and tilt.
 */
export const ComicPasswordInput = forwardRef<HTMLInputElement, ComicPasswordInputProps>(function ComicPasswordInput(
  { className, ...props },
  ref,
) {
  const t = useTranslations("ComicPasswordInput");
  const [visible, setVisible] = useState(false);
  const { claps, playClap, removeClap } = usePasswordClaps();

  const handleToggle = () => {
    playClap();
    setVisible((current) => !current);
  };

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
        onClick={handleToggle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.icon}
          src={visible ? PASSWORD_VISIBLE_ICON_SRC : PASSWORD_HIDDEN_ICON_SRC}
          alt=""
          aria-hidden
          draggable={false}
        />
        <PasswordClapBursts claps={claps} onClapDone={removeClap} />
      </button>
    </span>
  );
});

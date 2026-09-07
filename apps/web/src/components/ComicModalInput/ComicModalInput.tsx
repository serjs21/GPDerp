"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./ComicModalInput.module.css";

export type ComicModalInputProps = InputHTMLAttributes<HTMLInputElement>;

export const ComicModalInput = forwardRef<HTMLInputElement, ComicModalInputProps>(
  function ComicModalInput({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={[styles.input, className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  },
);

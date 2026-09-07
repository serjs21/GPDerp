"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { ComicModalInput } from "./ComicModalInput";
import styles from "./ComicModalSearchPanel.module.css";

export type ComicModalSearchPanelProps = InputHTMLAttributes<HTMLInputElement> & {
  panelClassName?: string;
};

export const ComicModalSearchPanel = forwardRef<HTMLInputElement, ComicModalSearchPanelProps>(
  function ComicModalSearchPanel({ className, panelClassName, type = "search", ...props }, ref) {
    return (
      <ComicPagePanel
        background="solid"
        color="white"
        className={[styles.panel, panelClassName].filter(Boolean).join(" ")}
      >
        <ComicModalInput ref={ref} type={type} className={className} {...props} />
      </ComicPagePanel>
    );
  },
);

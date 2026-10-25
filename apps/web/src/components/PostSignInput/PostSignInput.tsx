"use client";

import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { withDefaults } from "@/utils/props/withDefaults";
import { POST_SIGN_INPUT_WIDTH_REM } from "./constants";
import { PostSignArt } from "./PostSignArt";
import { PostSignForm } from "./PostSignForm";
import { useFooterClearance } from "@/hooks/useFooterClearance";
import { postSignRootClassName, postSignRootStyle } from "./utils/postSignInputUtils";

export type PostSignInputProps = {
  subject: string;
  onSubjectChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  submitLabel?: string;
  widthRem?: number;
  /** Pin to the viewport; rides up to stay above `footer`. */
  sticky?: boolean;
  /** Extra offset from the bottom while pinned (CSS `bottom`). Default 0. */
  stickyBottomPx?: number;
  /** Extra gap above the footer when the pin releases. Default 0. */
  stickyStopMarginPx?: number;
};

const POST_SIGN_INPUT_DEFAULTS = {
  isLoading: false,
  widthRem: POST_SIGN_INPUT_WIDTH_REM,
  sticky: false,
  stickyBottomPx: 20,
  stickyStopMarginPx: 0,
};

export function PostSignInput(props: PostSignInputProps) {
  const { isLoading, widthRem, sticky, stickyBottomPx, stickyStopMarginPx } = withDefaults(
    props,
    POST_SIGN_INPUT_DEFAULTS,
  );
  const t = useTranslations("PostSignInput");
  const footerClearancePx = useFooterClearance(sticky);
  const isHydrated = useIsHydrated();

  const article = (
    <article
      className={postSignRootClassName(sticky)}
      style={postSignRootStyle({ widthRem, sticky, stickyBottomPx, stickyStopMarginPx, footerClearancePx })}
      aria-label={t("signAriaLabel")}
    >
      <PostSignArt />
      <PostSignForm
        subject={props.subject}
        onSubjectChange={props.onSubjectChange}
        onSubmit={props.onSubmit}
        isLoading={isLoading}
        inputRef={props.inputRef}
        placeholder={props.placeholder}
        submitLabel={props.submitLabel}
      />
    </article>
  );

  if (sticky) {
    return isHydrated ? createPortal(article, document.body) : null;
  }
  return article;
}

import type { RefObject } from "react";

export type LegalScrollArrowProps = {
  /** Observed footer; while any of it is on screen the arrow points up and rides above it. */
  footerRef: RefObject<HTMLElement | null>;
};

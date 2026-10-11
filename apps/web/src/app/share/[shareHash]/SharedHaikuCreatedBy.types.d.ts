import type { SharedHaikuLanternProps } from "./SharedHaikuLantern.types";

export type SharedHaikuCreatedByProps = Pick<SharedHaikuLanternProps, "authorName"> & {
  /** Pixels the page footer overlaps the viewport bottom; the bubble lifts above it. */
  footerOverlap: number;
};

"use client";

import dynamic from "next/dynamic";
import type { NotFoundViewProps } from "./NotFoundView.types";

/**
 * Root `not-found` ships with every route's layout bundle, so the view (lantern, haiku actions,
 * share modal tree) loads only when a 404 actually renders. Import this file directly, not the barrel.
 */
export const NotFoundViewLazy = dynamic<NotFoundViewProps>(() =>
  import("./NotFoundView").then((mod) => mod.NotFoundView),
);

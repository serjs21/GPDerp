"use client";

import { useHtmlLoaderExit } from "@/hooks/useHtmlLoaderExit";
import type { HtmlLoaderExitProps } from "./HtmlLoaderExit.types";
import { markHtmlLoaderExited } from "./utils/htmlLoaderExitUtils";

/** Removes the server-rendered HtmlLoader on reveal with a comic page turn (react-pageflip). */
export function HtmlLoaderExit({ revealed }: HtmlLoaderExitProps) {
  const { FlipComponent, onDone } = useHtmlLoaderExit(revealed);
  return FlipComponent ? <FlipComponent onShown={markHtmlLoaderExited} onDone={onDone} /> : null;
}

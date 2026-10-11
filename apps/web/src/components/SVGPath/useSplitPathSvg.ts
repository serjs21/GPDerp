"use client";

import { useEffect, useState } from "react";
import type { SplitPathSvg } from "./SVGPath.types";
import { parseSplitPathSvg, splitPathSvgInnerMarkup } from "./utils";

const SVG_PATH_SRC = "/path/split_path_colored_stops.svg";

/** Fetches and parses the split path SVG once; `parsed` is null until it loads. */
export function useSplitPathSvg() {
  const [splitPath, setSplitPath] = useState<SplitPathSvg | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(SVG_PATH_SRC)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${SVG_PATH_SRC}`);
        }
        return response.text();
      })
      .then((markup) => {
        if (!cancelled) {
          setSplitPath({
            parsed: parseSplitPathSvg(markup),
            guideInner: splitPathSvgInnerMarkup(markup),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { splitPath, parsed: splitPath?.parsed ?? null };
}

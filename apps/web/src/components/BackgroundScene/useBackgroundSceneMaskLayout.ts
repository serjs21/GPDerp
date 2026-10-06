import { useEffect, useState, type RefObject } from "react";
import {
  backgroundSceneMaskLayout,
  type BackgroundSceneMaskLayout,
} from "./backgroundSceneMaskLayout";

const EMPTY_LAYOUT: BackgroundSceneMaskLayout = {
  scale: 1,
  maskWidthPx: 0,
  maskHeightPx: 0,
  maskPosition: "center bottom",
};

export function useBackgroundSceneMaskLayout(
  containerRef: RefObject<HTMLElement | null>,
): BackgroundSceneMaskLayout {
  const [layout, setLayout] = useState<BackgroundSceneMaskLayout>(EMPTY_LAYOUT);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Layout width (not getBoundingClientRect) so ancestor transforms, e.g. a scaled
    // postcard preview, don't shrink the mask relative to the art it masks.
    const update = (width: number) => {
      if (width <= 0) return;
      setLayout(backgroundSceneMaskLayout(width));
    };

    update(element.offsetWidth);
    const observer = new ResizeObserver(([entry]) => {
      update(entry.borderBoxSize?.[0]?.inlineSize ?? element.offsetWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);

  return layout;
}

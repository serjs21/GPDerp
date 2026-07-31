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

    const update = () => {
      const width = element.getBoundingClientRect().width;
      if (width <= 0) return;
      setLayout(backgroundSceneMaskLayout(width));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);

  return layout;
}

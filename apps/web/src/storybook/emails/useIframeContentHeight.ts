"use client";

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";

/** Height of a same-origin iframe's document, tracked as late images or fonts resize it. */
export function useIframeContentHeight(initialHeight: number) {
  const [height, setHeight] = useState(initialHeight);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const onLoad = useCallback((event: SyntheticEvent<HTMLIFrameElement>) => {
    const frame = event.currentTarget;
    const doc = frame.contentDocument;
    if (!doc) return;
    // scrollHeight never reports less than the frame's own height, so measure with the frame collapsed.
    const measure = () => {
      frame.style.height = "0px";
      const next = doc.documentElement.scrollHeight;
      frame.style.height = `${next}px`;
      setHeight(next);
    };
    measure();
    observerRef.current?.disconnect();
    observerRef.current = new ResizeObserver(measure);
    observerRef.current.observe(doc.body);
  }, []);

  return { height, onLoad };
}

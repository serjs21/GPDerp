"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { POSTCARD_MESSAGE_MAX_LINES } from "@/components/Postcard/consts/postcardMessageConsts";
import { measurePostcardMessageLines } from "@/components/Postcard/utils/postcardMessageMeasure";

export type PostcardMessageFit = {
  fits: boolean;
  linesLeft: number;
  /** True when `next` still fits on the postcard message box. */
  accepts: (next: string) => boolean;
};

/** Measure how much of the postcard message box `message` uses (re-measures once fonts load). */
export function usePostcardMessageFit(message: string): PostcardMessageFit {
  const [fontsVersion, setFontsVersion] = useState(0);

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let active = true;
    const bump = () => {
      if (active) setFontsVersion((value) => value + 1);
    };
    void document.fonts.ready.then(bump);
    document.fonts.addEventListener("loadingdone", bump);
    return () => {
      active = false;
      document.fonts.removeEventListener("loadingdone", bump);
    };
  }, []);

  const lines = useMemo(
    () => measurePostcardMessageLines(message),
    // fontsVersion re-measures after the handwriting font finishes loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [message, fontsVersion],
  );

  const accepts = useCallback(
    (next: string) => measurePostcardMessageLines(next) <= POSTCARD_MESSAGE_MAX_LINES,
    [],
  );

  return {
    fits: lines <= POSTCARD_MESSAGE_MAX_LINES,
    linesLeft: Math.max(0, POSTCARD_MESSAGE_MAX_LINES - lines),
    accepts,
  };
}

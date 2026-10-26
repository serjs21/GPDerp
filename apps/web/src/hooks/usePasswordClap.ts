"use client";

import { useRef, useState } from "react";
import type { PasswordClap } from "@/components/ComicPasswordInput/PasswordClapBurst.types";
import {
  pickPasswordClapColor,
  pickPasswordClapPlacement,
} from "@/components/ComicPasswordInput/utils/comicPasswordInputUtils";

/** Clap burst for the password toggle: each play replaces the shown one with a fresh colour and tilt. */
export function usePasswordClap() {
  const [clap, setClap] = useState<PasswordClap | null>(null);
  const clapIdRef = useRef(0);

  const playClap = () => {
    clapIdRef.current += 1;
    setClap({ id: clapIdRef.current, placement: pickPasswordClapPlacement(), color: pickPasswordClapColor() });
  };

  const clearClap = () => setClap(null);

  return { clap, playClap, clearClap };
}

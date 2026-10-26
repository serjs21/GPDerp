"use client";

import { useRef, useState } from "react";
import { PASSWORD_CLAP_MAX_COUNT } from "@/components/ComicPasswordInput/consts/comicPasswordInputConsts";
import type { PasswordClap } from "@/components/ComicPasswordInput/PasswordClapBursts.types";
import {
  pickPasswordClapColor,
  pickPasswordClapPlacement,
} from "@/components/ComicPasswordInput/utils/comicPasswordInputUtils";

/** Clap bursts for the password toggle: each play adds one in a random colour and free spot. */
export function usePasswordClaps() {
  const [claps, setClaps] = useState<PasswordClap[]>([]);
  const clapIdRef = useRef(0);

  const playClap = () => {
    // Drop the oldest bursts until the new one is under the limit and has a free spot.
    let kept = claps.slice(Math.max(0, claps.length - PASSWORD_CLAP_MAX_COUNT + 1));
    let placement = pickPasswordClapPlacement(kept.map((clap) => clap.placement));
    while (!placement && kept.length > 0) {
      kept = kept.slice(1);
      placement = pickPasswordClapPlacement(kept.map((clap) => clap.placement));
    }
    if (!placement) return;
    clapIdRef.current += 1;
    setClaps([...kept, { id: clapIdRef.current, placement, color: pickPasswordClapColor() }]);
  };

  const removeClap = (id: number) => {
    setClaps((current) => current.filter((clap) => clap.id !== id));
  };

  return { claps, playClap, removeClap };
}

// Server-safe (no "use client", no inline styles).
import { LanternBaseLoaderShell } from "@/components/Loaders/LanternBaseLoaderShell";
import { FetchingLanternFace } from "./FetchingLanternFace";
import type { FetchingLanternLoaderProps } from "./FetchingLanternLoader.types";

/** The lantern base with FetchingStaticLoader (running dog + "Fetching...") on its front panel. */
export function FetchingLanternLoader({ className }: FetchingLanternLoaderProps) {
  return (
    <LanternBaseLoaderShell className={className}>
      <FetchingLanternFace />
    </LanternBaseLoaderShell>
  );
}

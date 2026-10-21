"use client";

import { memo } from "react";
import { Lantern } from "@/components/Lantern/Lantern";
import { WagTailLanternFace } from "@/components/Loaders";
import type { SVGPathLanternBodyProps } from "./SVGPathLantern.types";

/** Loader slot, generating draft, or saved haiku inside an upright path lantern. */
export const SVGPathLanternBody = memo(function SVGPathLanternBody({
  haiku,
  generatingDraft,
  loading,
  showActions,
  onDelete,
  onChanged,
}: SVGPathLanternBodyProps) {
  if (loading) {
    return <WagTailLanternFace />;
  }
  if (generatingDraft) {
    return (
      <Lantern generatingDraft={generatingDraft} showActions={showActions} />
    );
  }
  if (!haiku) return null;
  return (
    <Lantern
      haiku={haiku}
      showActions={showActions}
      onDelete={onDelete}
      onChanged={onChanged}
    />
  );
});

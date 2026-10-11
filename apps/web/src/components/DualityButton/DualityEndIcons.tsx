import { DualityFaceIcon } from "./DualityFaceIcon";
import type { DualityEndIconsProps } from "./DualityButton.types";

/** Top/bottom face glyphs (used when no single centered glyph is set). */
export function DualityEndIcons({ topIconSrc, bottomIconSrc, iconTone }: DualityEndIconsProps) {
  return (
    <>
      {topIconSrc ? <DualityFaceIcon src={topIconSrc} position="top" tone={iconTone} /> : null}
      {bottomIconSrc ? <DualityFaceIcon src={bottomIconSrc} position="bottom" tone={iconTone} /> : null}
    </>
  );
}

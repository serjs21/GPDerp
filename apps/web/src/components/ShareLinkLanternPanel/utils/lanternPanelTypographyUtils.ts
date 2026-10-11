import type { CSSProperties } from "react";
import { buildPreviewLanternTypographyStyle } from "@/components/Lantern/utils/previewLanternTypography";

export function shareLinkLanternBodyStyle(body: string, title?: string): CSSProperties {
  return buildPreviewLanternTypographyStyle(body, {
    title,
    minBodyRem: 0.3,
    maxBodyRem: 0.72,
    maxTitleRem: 0.68,
    maxAuthorRem: 0.48,
  });
}

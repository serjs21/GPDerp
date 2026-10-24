import type { RefObject } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import type { HaikuDto } from "@/api/haikus";

export type ShareLinkListBodyProps = {
  /** List data still loading: only the centered loader renders. */
  showCenterLoader: boolean;
  /** Rows are rendered but hidden under the centered loader until their art is ready. */
  revealed: boolean;
  showEmpty: boolean;
  showBottomLoader: boolean;
  /** Rows whose haiku is settled, in list order. */
  items: ShareLinkListItem[];
  getHaiku: (haikuId: string | undefined) => HaikuDto | undefined;
  onChanged: () => void;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

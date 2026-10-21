import type { ReactNode, UIEvent } from "react";
import type { LabelDto } from "@/api/labels";

export type ManageLabelsListProps = {
  loading: boolean;
  fetchingNextPage: boolean;
  labels: LabelDto[];
  /** A search query is applied (empty copy says "no results" instead of "no labels"). */
  hasQuery: boolean;
  enterDelays: Record<string, number>;
  exitingById: Record<string, LabelDto>;
  onChanged: () => void;
  onExitStart: (label: LabelDto) => void;
  onExitComplete: (labelId: string) => void;
  onEnterAnimationEnd: (labelId: string) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  /** First-page and next-page loader; defaults to the sakura petal loader. */
  loader?: ReactNode;
};

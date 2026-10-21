import type { ReactNode, UIEvent } from "react";
import type { LabelDto } from "@/api/labels";

export type ManageLabelsListProps = {
  loading: boolean;
  fetchingNextPage: boolean;
  labels: LabelDto[];
  enterDelays: Record<string, number>;
  exitingById: Record<string, LabelDto>;
  onChanged: () => void;
  onExitStart: (label: LabelDto) => void;
  onExitComplete: (labelId: string) => void;
  onEnterAnimationEnd: (labelId: string) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  /** First-page / next-page loaders; each defaults to the sakura petal loader. */
  loaders?: ManageLabelsListLoaders;
};

export type ManageLabelsListLoaders = {
  initial?: ReactNode;
  nextPage?: ReactNode;
};

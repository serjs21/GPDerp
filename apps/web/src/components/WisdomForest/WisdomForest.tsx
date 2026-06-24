"use client";

import { HAIKU_LIST_PAGE_SIZE } from "@/api/haikus";
import { HaikuGenerationStickyNoteCard } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { ComponentType } from "react";
import { WisdomForestView } from "./WisdomForestView";

export type WisdomForestProps = {
  height?: string;
  width?: string;
  pageSize?: number;
  generatingDraft?: GeneratingDraft | null;
  PreviewCard?: ComponentType<HaikuContainerProps>;
  Loader?: ComponentType;
  className?: string;
};

export function WisdomForest({
  height = "60vh",
  width = "100%",
  pageSize = HAIKU_LIST_PAGE_SIZE,
  generatingDraft = null,
  PreviewCard = HaikuGenerationStickyNoteCard,
  Loader = SakuraPetalLoader,
  className,
}: WisdomForestProps) {
  const query = useInfiniteHaikusQuery({ pageSize });

  if (!query.initialized || !query.isLoggedIn) {
    return null;
  }

  return (
    <WisdomForestView
      haikus={query.haikus}
      isInitialLoading={query.isInitialLoading}
      isFetchingNextPage={query.isFetchingNextPage}
      isError={query.isError}
      hasNextPage={query.hasNextPage}
      onLoadMore={query.fetchNextPage}
      onRetry={query.refetch}
      onHaikuDeleted={query.invalidate}
      generatingDraft={generatingDraft}
      height={height}
      width={width}
      className={className}
      PreviewCard={PreviewCard}
      Loader={Loader}
    />
  );
}

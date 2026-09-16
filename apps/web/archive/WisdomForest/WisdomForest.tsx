"use client";

import type { HaikuDto } from "@/api/haikus";
import { HAIKU_LIST_PAGE_SIZE } from "@/api/haikus";
import { HaikuGenerationStickyNoteCard } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useRef, type ComponentType, type CSSProperties, type RefObject } from "react";
import { useWisdomForestStackScroll } from "./hooks/useWisdomForestStackScroll";
import { useWisdomForestState } from "./hooks/useWisdomForestState";
import { ForestShell, WisdomForestBody } from "./WisdomForestBody";
import styles from "./WisdomForest.module.css";

export type WisdomForestProps = {
  height?: string;
  width?: string;
  pageSize?: number;
  generatingDraft?: GeneratingDraft | null;
  PreviewCard?: ComponentType<HaikuContainerProps>;
  Loader?: ComponentType;
  className?: string;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
  onActiveCardIndexChange?: (index: number) => void;
  haikus?: HaikuDto[];
  isInitialLoading?: boolean;
  isFetchingNextPage?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  onHaikuDeleted?: () => void;
};

export function WisdomForest({
  height = "60vh",
  width = "100%",
  pageSize = HAIKU_LIST_PAGE_SIZE,
  generatingDraft = null,
  PreviewCard = HaikuGenerationStickyNoteCard,
  Loader = SakuraPetalLoader,
  className,
  scrollRootRef: externalScrollRootRef,
  onActiveCardIndexChange,
  haikus,
  isInitialLoading,
  isFetchingNextPage,
  isError,
  hasNextPage,
  onLoadMore,
  onRetry,
  onHaikuDeleted,
}: WisdomForestProps) {
  const internalScrollRootRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = externalScrollRootRef ?? internalScrollRootRef;
  const forestStyle = {
    "--wisdom-forest-height": height,
    "--wisdom-forest-width": width,
  } as CSSProperties;
  const forestClass = [styles.forest, className].filter(Boolean).join(" ");

  const state = useWisdomForestState({
    pageSize,
    generatingDraft,
    haikus,
    isInitialLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    onLoadMore,
    onRetry,
    onHaikuDeleted,
  });

  const { sentinelRef } = useWisdomForestStackScroll({
    scrollRootRef,
    cardCount: state.cardCount,
    hasNextPage: state.hasNextPage,
    isFetchingNextPage: state.isFetchingNextPage,
    onLoadMore: state.onLoadMore,
    onActiveCardIndexChange,
    enabled: !state.isError && state.cardCount > 0 && !state.isInitialLoading,
  });

  if (!state.ready) {
    return null;
  }

  if (state.isInitialLoading) {
    return (
      <ForestShell
        forestStyle={forestStyle}
        forestClass={forestClass}
        scrollRootRef={scrollRootRef}
        ariaBusy
        ariaLabel="Loading haikus"
      >
        <div className={styles.initialLoader}>
          <Loader />
        </div>
      </ForestShell>
    );
  }

  return (
    <ForestShell
      forestStyle={forestStyle}
      forestClass={forestClass}
      scrollRootRef={scrollRootRef}
      ariaLabel="Haiku preview forest"
    >
      <WisdomForestBody
        state={state}
        generatingDraft={generatingDraft}
        PreviewCard={PreviewCard}
        Loader={Loader}
        sentinelRef={sentinelRef}
      />
    </ForestShell>
  );
}

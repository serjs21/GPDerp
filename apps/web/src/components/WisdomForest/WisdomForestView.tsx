"use client";

import type { HaikuDto } from "@/api/haikus";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { useRef, useEffect, type ComponentType, type CSSProperties, type RefObject, useLayoutEffect } from "react";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useWisdomForestStackScroll } from "./hooks/useWisdomForestStackScroll";
import { WisdomForestCards } from "./WisdomForestCards";
import { WisdomForestErrorFooter } from "./WisdomForestErrorFooter";
import styles from "./WisdomForest.module.css";

type WisdomForestScrollBodyProps = {
  haikus: HaikuDto[];
  generatingDraft: GeneratingDraft | null;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onHaikuDeleted?: () => void;
  PreviewCard: ComponentType<HaikuContainerProps>;
  Loader: ComponentType;
  scrollRootRef: RefObject<HTMLDivElement | null>;
  onActiveCardIndexChange?: (index: number) => void;
};

function WisdomForestScrollBody({
  haikus,
  generatingDraft,
  isFetchingNextPage,
  isError,
  hasNextPage,
  onLoadMore,
  onRetry,
  onHaikuDeleted,
  PreviewCard,
  Loader,
  scrollRootRef,
  onActiveCardIndexChange,
}: WisdomForestScrollBodyProps) {
  const cardCount = haikus.length + (generatingDraft ? 1 : 0);
  const showEmpty = cardCount === 0 && !isError && !generatingDraft;

  const { sentinelRef, activeCardIndex } = useWisdomForestStackScroll({
    scrollRootRef,
    cardCount,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    enabled: !isError && cardCount > 0,
  });

  useEffect(() => {
    onActiveCardIndexChange?.(activeCardIndex);
  }, [activeCardIndex, onActiveCardIndexChange]);

  return (
    <>
      {showEmpty ? <p className={styles.empty}>No saved haikus yet.</p> : null}
      {cardCount > 0 ? (
        <div className={styles.scrollContent} style={{ "--numcards": cardCount } as CSSProperties}>
          <WisdomForestCards
            haikus={haikus}
            generatingDraft={generatingDraft}
            onHaikuDeleted={onHaikuDeleted}
            PreviewCard={PreviewCard}
          />
          <div className={styles.stackEndPad} aria-hidden />
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
          {isFetchingNextPage ? (
            <div className={styles.loaderRow}>
              <Loader />
            </div>
          ) : null}
        </div>
      ) : null}
      {isError ? <WisdomForestErrorFooter onRetry={onRetry} /> : null}
    </>
  );
}

export type WisdomForestViewProps = {
  haikus: HaikuDto[];
  isInitialLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onHaikuDeleted?: () => void;
  generatingDraft?: GeneratingDraft | null;
  height?: string;
  width?: string;
  className?: string;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
  onActiveCardIndexChange?: (index: number) => void;
  PreviewCard: ComponentType<HaikuContainerProps>;
  Loader: ComponentType;
};

export function WisdomForestView({
  haikus,
  isInitialLoading,
  isFetchingNextPage,
  isError,
  hasNextPage,
  onLoadMore,
  onRetry,
  onHaikuDeleted,
  generatingDraft = null,
  height = "60vh",
  width = "100%",
  className,
  scrollRootRef: externalScrollRootRef,
  onActiveCardIndexChange,
  PreviewCard,
  Loader,
}: WisdomForestViewProps) {
  const internalScrollRootRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = externalScrollRootRef ?? internalScrollRootRef;
  const forestStyle = {
    "--wisdom-forest-height": height,
    "--wisdom-forest-width": width,
  } as CSSProperties;
  const forestClass = [styles.forest, className].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const el = scrollRootRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  if (isInitialLoading) {
    return (
      <div className={styles.forestClip} style={forestStyle} aria-busy="true" aria-label="Loading haikus">
        <div className={forestClass}>
          <div className={styles.initialLoader}>
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.forestClip} style={forestStyle} aria-label="Haiku preview forest">
      <div ref={scrollRootRef} className={forestClass}>
        <WisdomForestScrollBody
          haikus={haikus}
          generatingDraft={generatingDraft}
          isFetchingNextPage={isFetchingNextPage}
          isError={isError}
          hasNextPage={hasNextPage}
          onLoadMore={onLoadMore}
          onRetry={onRetry}
          onHaikuDeleted={onHaikuDeleted}
          PreviewCard={PreviewCard}
          Loader={Loader}
          scrollRootRef={scrollRootRef}
          onActiveCardIndexChange={onActiveCardIndexChange}
        />
      </div>
    </div>
  );
}

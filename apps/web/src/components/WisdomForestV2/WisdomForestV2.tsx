"use client";

import type { HaikuDto } from "@/api/haikus";
import { HaikuGenerationStickyNoteCard } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useRef, type ComponentType, type CSSProperties, type RefObject } from "react";
import { useWisdomForestV2Scroll } from "./hooks/useWisdomForestV2Scroll";
import { getWisdomForestV2CardCount } from "./wisdomForestV2Stack";
import { WisdomForestV2Cards } from "./WisdomForestV2Cards";
import styles from "./WisdomForestV2.module.css";

export type WisdomForestV2Props = {
  haikus: HaikuDto[];
  generatingDraft?: GeneratingDraft | null;
  PreviewCard?: ComponentType<HaikuContainerProps>;
  Loader?: ComponentType;
  height?: string;
  width?: string;
  className?: string;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
  onActiveCardIndexChange?: (index: number) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onHaikuDeleted?: () => void;
};

export function WisdomForestV2({
  haikus,
  generatingDraft = null,
  PreviewCard = HaikuGenerationStickyNoteCard,
  Loader = SakuraPetalLoader,
  height = "60vh",
  width = "100%",
  className,
  scrollRootRef: externalScrollRootRef,
  onActiveCardIndexChange,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onHaikuDeleted,
}: WisdomForestV2Props) {
  const internalScrollRootRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = externalScrollRootRef ?? internalScrollRootRef;
  const cardCount = getWisdomForestV2CardCount(haikus, generatingDraft);

  const forestStyle = {
    "--wf2-height": height,
    "--wf2-width": width,
  } as CSSProperties;
  const forestClass = [styles.forest, className].filter(Boolean).join(" ");

  const { sentinelRef } = useWisdomForestV2Scroll({
    scrollRootRef,
    cardCount,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    onActiveCardIndexChange,
    enabled: cardCount > 0,
  });

  return (
    <div
      className={styles.forestClip}
      style={forestStyle}
      aria-label="Haiku preview forest"
    >
      <div ref={scrollRootRef} className={forestClass}>
        {cardCount <= 0 ? (
          <p className={styles.empty}>No saved haikus yet.</p>
        ) : (
          <div className={styles.scrollContent} style={{ "--numcards": cardCount } as CSSProperties}>
            <WisdomForestV2Cards
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
        )}
      </div>
    </div>
  );
}

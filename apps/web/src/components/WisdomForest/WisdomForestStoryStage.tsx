"use client";

import { useCallback, useRef, useState, type ComponentProps } from "react";
import {
  computeStackStep,
  getMaxContentScrollTop,
  getRootFontSizePx,
  getStackSlotHeightPx,
} from "./wisdomForestStackScroll";
import { WisdomForestView } from "./WisdomForestView";
import styles from "./WisdomForest.stories.module.css";

type WisdomForestStoryStageProps = ComponentProps<typeof WisdomForestView>;

export function WisdomForestStoryStage(props: WisdomForestStoryStageProps) {
  const forestRef = useRef<HTMLDivElement>(null);
  const cardCount = props.haikus.length + (props.generatingDraft ? 1 : 0);
  const maxCardIndex = Math.max(0, cardCount - 1);
  const [activeCardIndex, setActiveCardIndex] = useState(maxCardIndex);

  const stepScroll = useCallback((direction: -1 | 1) => {
    const root = forestRef.current;
    if (!root) return;
    const rootFontSizePx = getRootFontSizePx(root);
    const slotHeightPx = getStackSlotHeightPx(rootFontSizePx);
    const maxScroll = getMaxContentScrollTop(cardCount, slotHeightPx);
    const { scrollTop, activeCardIndex: nextIndex } = computeStackStep(
      root.scrollTop,
      direction,
      slotHeightPx,
      maxScroll,
      cardCount,
    );
    root.scrollTop = scrollTop;
    setActiveCardIndex(nextIndex);
  }, [cardCount]);

  const forestClass = [styles.scrollForest, props.className].filter(Boolean).join(" ");

  return (
    <div className={styles.stage}>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.scrollButton}
          disabled={activeCardIndex <= 0 || cardCount <= 1}
          onClick={() => stepScroll(-1)}
        >
          Newer
        </button>
        <button
          type="button"
          className={styles.scrollButton}
          disabled={activeCardIndex >= maxCardIndex || cardCount <= 1}
          onClick={() => stepScroll(1)}
        >
          Older
        </button>
        <p className={styles.focusLabel}>
          Card {activeCardIndex + 1} of {cardCount} (newest → oldest)
        </p>
      </div>
      <div className={styles.forestShell}>
        {cardCount > 1 ? (
          <div className={styles.ruler} aria-hidden>
            {Array.from({ length: cardCount }, (_, index) => (
              <div
                key={index}
                className={[
                  styles.rulerTick,
                  index === activeCardIndex ? styles.rulerTickActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>
        ) : null}
        <WisdomForestView
          {...props}
          scrollRootRef={forestRef}
          className={forestClass}
          onActiveCardIndexChange={setActiveCardIndex}
        />
      </div>
    </div>
  );
}

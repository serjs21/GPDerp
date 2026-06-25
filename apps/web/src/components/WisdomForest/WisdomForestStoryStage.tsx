"use client";

import type { ComponentProps } from "react";
import { useWisdomForestStepScroll } from "./hooks/useWisdomForestStepScroll";
import { WisdomForest } from "./WisdomForest";
import styles from "./WisdomForest.stories.module.css";

type WisdomForestStoryStageProps = ComponentProps<typeof WisdomForest>;

export function WisdomForestStoryStage(props: WisdomForestStoryStageProps) {
  const { forestRef, activeCardIndex, setActiveCardIndex, stepScroll, maxCardIndex, cardCount } =
    useWisdomForestStepScroll({
      haikus: props.haikus ?? [],
      generatingDraft: props.generatingDraft,
    });

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
        <WisdomForest
          {...props}
          scrollRootRef={forestRef}
          className={forestClass}
          onActiveCardIndexChange={setActiveCardIndex}
        />
      </div>
    </div>
  );
}

import type { RefObject, ReactNode } from "react";
import type { ComponentType, CSSProperties } from "react";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { Button } from "@/components/StyledComponents";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { WisdomForestResolvedState } from "./wisdomForestState";
import { WisdomForestCards } from "./WisdomForestCards";
import styles from "./WisdomForest.module.css";

type WisdomForestBodyProps = {
  state: WisdomForestResolvedState;
  generatingDraft: GeneratingDraft | null;
  PreviewCard: ComponentType<HaikuContainerProps>;
  Loader: ComponentType;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

export function WisdomForestBody({
  state,
  generatingDraft,
  PreviewCard,
  Loader,
  sentinelRef,
}: WisdomForestBodyProps) {
  return (
    <>
      {state.showEmpty ? <p className={styles.empty}>No saved haikus yet.</p> : null}
      {state.cardCount > 0 ? (
        <div className={styles.scrollContent} style={{ "--numcards": state.cardCount } as CSSProperties}>
          <WisdomForestCards
            haikus={state.haikus}
            generatingDraft={generatingDraft}
            onHaikuDeleted={state.onHaikuDeleted}
            PreviewCard={PreviewCard}
          />
          <div className={styles.stackEndPad} aria-hidden />
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
          {state.isFetchingNextPage ? (
            <div className={styles.loaderRow}>
              <Loader />
            </div>
          ) : null}
        </div>
      ) : null}
      {state.isError ? (
        <div className={styles.footerActions}>
          <Button type="primary" onClick={state.onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </>
  );
}

type ForestShellProps = {
  forestStyle: CSSProperties;
  forestClass: string;
  scrollRootRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  ariaBusy?: boolean;
  ariaLabel: string;
};

export function ForestShell({
  forestStyle,
  forestClass,
  scrollRootRef,
  children,
  ariaBusy,
  ariaLabel,
}: ForestShellProps) {
  return (
    <div
      className={styles.forestClip}
      style={forestStyle}
      aria-busy={ariaBusy}
      aria-label={ariaLabel}
    >
      <div ref={scrollRootRef} className={forestClass}>
        {children}
      </div>
    </div>
  );
}

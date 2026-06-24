import type { HaikuDto } from "@/api/haikus";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { ComponentType, CSSProperties, RefObject } from "react";
import styles from "./WisdomForest.module.css";

type WisdomForestCardsProps = {
  haikus: HaikuDto[];
  generatingDraft: GeneratingDraft | null;
  isFetchingNextPage: boolean;
  onHaikuDeleted?: () => void;
  PreviewCard: ComponentType<HaikuContainerProps>;
  Loader: ComponentType;
  sentinelRef: RefObject<HTMLLIElement | null>;
};

export function WisdomForestCards({
  haikus,
  generatingDraft,
  isFetchingNextPage,
  onHaikuDeleted,
  PreviewCard,
  Loader,
  sentinelRef,
}: WisdomForestCardsProps) {
  const cardCount = haikus.length + (generatingDraft ? 1 : 0);

  return (
    <ol className={styles.cards} style={{ "--numcards": cardCount } as CSSProperties}>
      {generatingDraft ? (
        <li className={styles.card} style={{ "--index": 1 } as CSSProperties}>
          <div className={styles.cardContent}>
            <PreviewCard generatingDraft={generatingDraft} />
          </div>
        </li>
      ) : null}
      {haikus.map((haiku, haikuIndex) => (
        <li
          key={haiku.id}
          className={styles.card}
          style={{ "--index": generatingDraft ? haikuIndex + 2 : haikuIndex + 1 } as CSSProperties}
        >
          <div className={styles.cardContent}>
            <PreviewCard haiku={haiku} onDeleted={onHaikuDeleted} onChanged={onHaikuDeleted} />
          </div>
        </li>
      ))}
      <li ref={sentinelRef} className={styles.sentinel} aria-hidden />
      {isFetchingNextPage ? (
        <li className={styles.loaderRow}>
          <Loader />
        </li>
      ) : null}
    </ol>
  );
}

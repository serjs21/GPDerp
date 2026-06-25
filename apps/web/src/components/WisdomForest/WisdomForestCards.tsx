import type { HaikuDto } from "@/api/haikus";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { ComponentType, CSSProperties } from "react";
import { getWisdomForestCardCount } from "./wisdomForestStackScroll";
import styles from "./WisdomForest.module.css";

type WisdomForestCardsProps = {
  haikus: HaikuDto[];
  generatingDraft: GeneratingDraft | null;
  onHaikuDeleted?: () => void;
  PreviewCard: ComponentType<HaikuContainerProps>;
};

export function WisdomForestCards({
  haikus,
  generatingDraft,
  onHaikuDeleted,
  PreviewCard,
}: WisdomForestCardsProps) {
  const cardCount = getWisdomForestCardCount(haikus, generatingDraft);

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
    </ol>
  );
}

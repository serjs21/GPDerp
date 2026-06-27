"use client";

import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { HaikuGenerationStickyNoteCard } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import { BranchConnectors } from "./BranchConnectors/BranchConnectors";
import { SakuraBranch } from "./SakuraBranch/SakuraBranch";
import { getWisdomBranchLayoutVars } from "./wisdomBranchLayoutVars";
import styles from "./WisdomBranch.module.css";

export type WisdomBranchProps = HaikuContainerProps & {
  angle?: number;
  scale?: number;
};

export function WisdomBranch({ angle, scale, ...noteProps }: WisdomBranchProps) {
  return (
    <article
      className={styles.wrapper}
      style={getWisdomBranchLayoutVars()}
      aria-label="Haiku on branch"
    >
      <SakuraBranch angle={angle} scale={scale} className={styles.branchSlot} />
      <BranchConnectors />
      <div className={styles.note}>
        <HaikuGenerationStickyNoteCard {...noteProps} />
      </div>
    </article>
  );
}

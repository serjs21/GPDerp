"use client";

import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { HaikuGenerationStickyNoteCard } from "@/components/HaikuGenerationStickyNote/HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import { BranchConnectors } from "./BranchConnectors/BranchConnectors";
import { SakuraBranch } from "./SakuraBranch/SakuraBranch";
import styles from "./WisdomBranch.module.css";

export type WisdomBranchProps = HaikuContainerProps & {
  angle?: number;
  scale?: number;
};

export function WisdomBranch({ angle, scale, ...noteProps }: WisdomBranchProps) {
  return (
    <article className={styles.wrapper} aria-label="Haiku on branch">
      <div className={styles.branchZone}>
        <SakuraBranch angle={angle} scale={scale} />
      </div>
      <BranchConnectors />
      <div className={styles.noteZone}>
        <HaikuGenerationStickyNoteCard {...noteProps} />
      </div>
    </article>
  );
}

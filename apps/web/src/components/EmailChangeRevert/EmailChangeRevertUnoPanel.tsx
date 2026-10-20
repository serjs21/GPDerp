import { ComicPagePanel } from "@/components/ComicPageLayout";
import { UNO_REVERSE_SRC } from "./consts/emailChangeRevertConsts";
import type { EmailChangeRevertUnoPanelProps } from "./EmailChangeRevertUnoPanel.types";
import styles from "./EmailChangeRevertView.module.css";

/** Narrow sunburst panel holding the decorative Uno reverse card. */
export function EmailChangeRevertUnoPanel({ color }: EmailChangeRevertUnoPanelProps) {
  return (
    <ComicPagePanel background="sunburst" color={color} className={styles.unoPanel}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img className={styles.unoCard} src={UNO_REVERSE_SRC} alt="" width={344} height={524} draggable={false} />
    </ComicPagePanel>
  );
}

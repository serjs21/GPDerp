import styles from "./page.module.css";
import { HaikuGenerationStickyNote } from "@/components/HaikuGenerationStickyNote";

export default function Home() {
  return (
    <div className={styles.page} data-page-root>
      <div className={styles.vgBg} aria-hidden>
        <div className={styles.vgArt} />
        <div className={styles.vgMountains} />
      </div>
      <div className={styles.paperPlaneFlyLayer} data-paper-plane-background aria-hidden />
      <main className={styles.main}>
        <HaikuGenerationStickyNote />
      </main>
    </div>
  );
}

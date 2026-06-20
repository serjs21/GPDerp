import styles from "./page.module.css";
import { HaikuGenerationStickyNote } from "@/components/HaikuGenerationStickyNote";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.vgBg} aria-hidden>
        <div className={styles.vgArt} />
        <div className={styles.vgMountains} />
      </div>
      <main className={styles.main}>
        <HaikuGenerationStickyNote />
      </main>
    </div>
  );
}

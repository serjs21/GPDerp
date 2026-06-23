import styles from "./page.module.css";
import { HaikuGenerationStickyNote } from "@/components/HaikuGenerationStickyNote";
import { DaylightBackground } from "@/components/DaylightBackground";
import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";

export default function Home() {
  return (
    <div className={styles.page} data-page-root>
      <DaylightBackground />
      <div className={styles.paperPlaneFlyLayer} data-paper-plane-background aria-hidden />
      <main className={styles.main}>
        <CenteredAuthPrompt />
        <HaikuGenerationStickyNote />
      </main>
    </div>
  );
}

import styles from "./page.module.css";
import { HaikuGenerationChat } from "@/components/HaikuGenerationChat/HaikuGenerationChat";

export default function Home() {
  return (
    <div className={`${styles.page}}`}>
      <div className={styles.vgBg} aria-hidden />
      <main className={styles.main}>
        <HaikuGenerationChat />
        
        <pre
          style={{
            whiteSpace: "pre-wrap",
            margin: 0,
            fontSize: 18,
            lineHeight: 1.5,
          }}
        >
          {"Stars blink, I wonder—\nAm I just dust in the void,\nOr meaning’s whisper?"}
        </pre>
      </main>
    </div>
  );
}

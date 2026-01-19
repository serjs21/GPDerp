import styles from "./page.module.css";
import { SocketStatusDisplay } from "@/components/SocketStatusDisplay";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
       <header>Hello world</header>
       <SocketStatusDisplay />
    <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: 18, lineHeight: 1.5 }}>
      {"Stars blink, I wonder—\nAm I just dust in the void,\nOr meaning’s whisper?"}
    </pre>
      </main>
    </div>
  );
}

import { fetchSharedHaikuByHash } from "@/api/shareLink";
import { formatHaikuTitle } from "@/utils/strings";
import { SharedHaikuLantern } from "./SharedHaikuLantern";
import styles from "./styles.module.css";

export default async function SharedHaikuPage({ params }: { params: Promise<{ shareHash: string }> }) {
  const { shareHash } = await params;
  const result = await fetchSharedHaikuByHash(shareHash);

  if (!result.ok) {
    return (
      <div className={styles.page}>
        <article className={styles.card}>
          <h1 className={styles.errorTitle}>This link is unavailable</h1>
          <p className={styles.errorBody}>{result.error}</p>
          <p className={styles.errorHint}>
            Share links can expire, hit their view limit, or be removed by the creator.
          </p>
        </article>
      </div>
    );
  }

  const { haiku, sharedByUserName, showLabels } = result.data;
  const providerName = sharedByUserName?.trim() || "Unknown author";

  return (
    <div className={styles.page}>
      <div className={styles.contentContainer}>
        <SharedHaikuLantern
          haiku={haiku}
          showLabels={showLabels}
          subject={formatHaikuTitle(haiku, false)}
        />
      </div>
    </div>
  );
}

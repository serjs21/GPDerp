import { notFound } from "next/navigation";
import { fetchSharedHaikuByHash } from "@/api/shareLink";
import { formatHaikuTitle } from "@/utils/strings";
import { SharedHaikuLantern } from "./SharedHaikuLantern";
import styles from "./styles.module.css";

export default async function SharedHaikuPage({ params }: { params: Promise<{ shareHash: string }> }) {
  const { shareHash } = await params;
  const result = await fetchSharedHaikuByHash(shareHash);

  if (!result.ok) {
    notFound();
  }

  const { haiku, sharedByUserName, showLabels } = result.data;
  const providerName = sharedByUserName?.trim() || "Unknown author";

  return (
    <div className={styles.page}>
      <div className={styles.contentContainer}>
        <span className={styles.providedBy}>
          A poem from <strong>{providerName}</strong>:
        </span>
        <SharedHaikuLantern
          haiku={haiku}
          showLabels={showLabels}
          subject={formatHaikuTitle(haiku, false)}
        />
      </div>
    </div>
  );
}

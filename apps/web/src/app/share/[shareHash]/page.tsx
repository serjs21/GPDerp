import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { fetchSharedHaikuByHash } from "@/api/shareLink";
import { NotFoundView } from "@/components/NotFoundView";
import { formatHaikuTitle } from "@/utils/strings";
import { SharedHaikuLantern } from "./SharedHaikuLantern";
import styles from "./styles.module.css";

export default async function SharedHaikuPage({ params }: { params: Promise<{ shareHash: string }> }) {
  const { shareHash } = await params;
  const accessToken = (await cookies()).get("access_token")?.value;
  const result = await fetchSharedHaikuByHash(shareHash, accessToken);

  /* Not `notFound()`: a throwing server component crashes React's dev perf logging (negative measure timestamp). */
  if (!result.ok) {
    return <NotFoundView />;
  }

  const { haiku, sharedByUserName, showLabels } = result.data;
  const t = await getTranslations("SharedHaikuPage");
  const providerName = sharedByUserName?.trim() || t("unknownAuthor");

  return (
    <div className={styles.page}>
      <div className={styles.contentContainer}>
        <SharedHaikuLantern
          haiku={haiku}
          showLabels={showLabels}
          subject={formatHaikuTitle(haiku, false)}
          authorName={providerName}
        />
      </div>
    </div>
  );
}

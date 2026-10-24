import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import { refundPolicy as markdown } from "@/content/legalContent.generated";
import styles from "../terms/terms.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LegalPages.refund");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export const dynamic = "force-static";

export default async function RefundPage() {
  const t = await getTranslations("LegalPages");

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <Link href="/" className={styles.back}>
          {t("back")}
        </Link>
        <article className={styles.prose}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

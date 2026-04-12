import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import styles from "../terms/terms.module.css";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refunds, subscription cancellation, and billing for the Haiku generation service via Paddle.",
};

export const dynamic = "force-static";

async function loadRefundMarkdown(): Promise<string> {
  const filePath = path.join(process.cwd(), "src", "content", "refund-policy.md");
  return readFile(filePath, "utf-8");
}

export default async function RefundPage() {
  const markdown = await loadRefundMarkdown();

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <article className={styles.prose}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

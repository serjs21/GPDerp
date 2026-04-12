import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import styles from "./terms.module.css";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of the Haiku generation service, billing via Paddle, and related policies.",
};

export const dynamic = "force-static";

async function loadTermsMarkdown(): Promise<string> {
  const filePath = path.join(process.cwd(), "src", "content", "terms-of-service.md");
  return readFile(filePath, "utf-8");
}

export default async function TermsPage() {
  const markdown = await loadTermsMarkdown();

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

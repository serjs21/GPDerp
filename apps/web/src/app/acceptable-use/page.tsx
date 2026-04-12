import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import styles from "../terms/terms.module.css";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Rules for fair use of the Haiku generation service.",
};

export const dynamic = "force-static";

async function loadMarkdown(): Promise<string> {
  const filePath = path.join(process.cwd(), "src", "content", "acceptable-use-policy.md");
  return readFile(filePath, "utf-8");
}

export default async function AcceptableUsePage() {
  const markdown = await loadMarkdown();

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

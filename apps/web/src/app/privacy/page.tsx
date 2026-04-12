import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import styles from "../terms/terms.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How we collect, use, and protect data for the Haiku generation service, including payments via Paddle.",
};

export const dynamic = "force-static";

async function loadPrivacyMarkdown(): Promise<string> {
  const filePath = path.join(process.cwd(), "src", "content", "privacy-policy.md");
  return readFile(filePath, "utf-8");
}

export default async function PrivacyPage() {
  const markdown = await loadPrivacyMarkdown();

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

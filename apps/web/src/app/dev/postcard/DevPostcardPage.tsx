"use client";

import { useState } from "react";
import { PostcardPreview } from "@/components/Postcard/PostcardPreview";
import { POSTCARD_DEV_SAMPLE_HAIKU } from "@/components/Postcard/consts/postcardDevConsts";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { usePostcardTheme } from "@/hooks/usePostcardTheme";
import styles from "./DevPostcardPage.module.css";

export function DevPostcardPage() {
  const theme = usePostcardTheme();
  const { haikus, isLoggedIn } = useInfiniteHaikusQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const haiku =
    haikus.find((item) => item.id === selectedId) ?? haikus[0] ?? POSTCARD_DEV_SAMPLE_HAIKU;

  return (
    <main className={styles.root}>
      <h1 className={styles.heading}>Postcard preview (dev)</h1>
      <p className={styles.hint}>
        Theme follows the header time-of-day selector.{" "}
        {isLoggedIn && haikus.length > 0
          ? "Pick one of your haikus below."
          : "Showing a sample haiku (log in to use your own)."}
      </p>
      {haikus.length > 0 ? (
        <select
          className={styles.select}
          value={haiku.id}
          onChange={(event) => setSelectedId(event.target.value)}
          aria-label="Haiku"
        >
          {haikus.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title || item.body.split("\n")[0]}
            </option>
          ))}
        </select>
      ) : null}
      <PostcardPreview theme={theme} haiku={haiku} scale={0.5} />
    </main>
  );
}

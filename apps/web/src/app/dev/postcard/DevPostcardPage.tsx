"use client";

import { useState } from "react";
import { fetchServerPostcardBack } from "@/api/postcardDev";
import { generatePostcardImage } from "@/components/Postcard/generatePostcardImage";
import { PostcardMessage } from "@/components/Postcard/PostcardMessage";
import { PostcardPreview } from "@/components/Postcard/PostcardPreview";
import { PostcardRenderer } from "@/components/Postcard/PostcardRenderer";
import { postcardFilename } from "@/components/Postcard/postcardDevDownload";
import {
  POSTCARD_DEV_SAMPLE_HAIKU,
  POSTCARD_DEV_SAMPLE_MESSAGE,
  POSTCARD_DEV_SAMPLE_RECIPIENTS,
} from "@/components/Postcard/consts/postcardDevConsts";
import { POSTCARD_MESSAGE_MAX_CHARS } from "@/components/Postcard/consts/postcardMessageConsts";
import { clampPostcardMessage } from "@/components/Postcard/utils/postcardMessageFit";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { usePostcardMessageFit } from "@/hooks/usePostcardMessageFit";
import { usePostcardTheme } from "@/hooks/usePostcardTheme";
import styles from "./DevPostcardPage.module.css";

const parseRecipients = (value: string) =>
  value
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export function DevPostcardPage() {
  const theme = usePostcardTheme();
  const { haikus, isLoggedIn } = useInfiniteHaikusQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState(POSTCARD_DEV_SAMPLE_MESSAGE);
  const [senderName, setSenderName] = useState("Aki");
  const [recipientsText, setRecipientsText] = useState(POSTCARD_DEV_SAMPLE_RECIPIENTS.join(", "));
  const fit = usePostcardMessageFit(message);
  const haiku =
    haikus.find((item) => item.id === selectedId) ?? haikus[0] ?? POSTCARD_DEV_SAMPLE_HAIKU;
  const recipients = parseRecipients(recipientsText);
  const previewRecipient = recipients[0] ?? "";

  const onMessageChange = (raw: string) => {
    const next = clampPostcardMessage(raw);
    if (next.length > message.length && !fit.accepts(next)) return;
    setMessage(next);
  };

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

      <h2 className={styles.subheading}>Front</h2>
      <PostcardPreview
        generate={() => generatePostcardImage({ theme, haiku })}
        filename={postcardFilename(haiku.id, "front")}
        scale={0.5}
      >
        <PostcardRenderer theme={theme} haiku={haiku} />
      </PostcardPreview>

      <h2 className={styles.subheading}>Back (message side, previewed for the first recipient)</h2>
      <div className={styles.fields}>
        <label className={styles.field}>
          Message ({fit.linesLeft} lines left)
          <textarea
            className={styles.textarea}
            value={message}
            maxLength={POSTCARD_MESSAGE_MAX_CHARS}
            onChange={(event) => onMessageChange(event.target.value)}
            rows={4}
          />
        </label>
        <label className={styles.field}>
          Sender name
          <input value={senderName} onChange={(event) => setSenderName(event.target.value)} />
        </label>
        <label className={styles.field}>
          Recipients (comma separated)
          <input value={recipientsText} onChange={(event) => setRecipientsText(event.target.value)} />
        </label>
      </div>
      <PostcardPreview
        generate={() => fetchServerPostcardBack({ message, senderName, recipient: previewRecipient })}
        filename={postcardFilename(haiku.id, "back")}
        scale={0.5}
        label="Live message side (server PNG on the right)"
      >
        <PostcardMessage message={message} senderName={senderName} recipient={previewRecipient} />
      </PostcardPreview>
    </main>
  );
}

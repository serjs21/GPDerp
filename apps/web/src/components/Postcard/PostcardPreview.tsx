"use client";

import { useEffect, useState } from "react";
import { generatePostcardImage } from "./generatePostcardImage";
import { PostcardRenderer } from "./PostcardRenderer";
import type { PostcardPreviewProps } from "./PostcardPreview.types";
import {
  downloadPostcardBlob,
  openPostcardBlob,
  postcardFilename,
} from "./postcardDevDownload";
import { buildPostcardPreviewStyle } from "./utils/postcardStyleUtils";
import styles from "./PostcardPreview.module.css";

type GeneratedPostcard = { blob: Blob; url: string; ms: number };

/** Dev-only: live scaled renderer next to the captured PNG, with download/open actions. */
export function PostcardPreview({ theme, haiku, fontScale, scale = 0.5 }: PostcardPreviewProps) {
  const [generated, setGenerated] = useState<GeneratedPostcard | null>(null);
  const [pngSize, setPngSize] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (generated) URL.revokeObjectURL(generated.url);
    };
  }, [generated]);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const started = performance.now();
      const blob = await generatePostcardImage({ theme, haiku, fontScale });
      setPngSize(null);
      setGenerated({ blob, url: URL.createObjectURL(blob), ms: performance.now() - started });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  const open = () => {
    if (!generated) return;
    try {
      openPostcardBlob(generated.blob);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const previewStyle = buildPostcardPreviewStyle(scale);

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <button type="button" onClick={generate} disabled={busy} data-testid="postcard-generate">
          {busy ? "Generating…" : "Generate PNG"}
        </button>
        <button
          type="button"
          onClick={() => generated && downloadPostcardBlob(generated.blob, postcardFilename(haiku.id))}
          disabled={!generated}
        >
          Download PNG
        </button>
        <button type="button" onClick={open} disabled={!generated}>
          Open PNG
        </button>
        {generated ? (
          <span className={styles.meta} data-testid="postcard-meta">
            {`${Math.round(generated.blob.size / 1024)} KB · ${Math.round(generated.ms)} ms${pngSize ? ` · ${pngSize}` : ""}`}
          </span>
        ) : null}
        {error ? <span className={styles.error}>{error}</span> : null}
      </div>

      <div className={styles.panes}>
        <figure className={styles.pane}>
          <figcaption>Live renderer</figcaption>
          <div className={styles.frame} style={previewStyle}>
            <div className={styles.scaled}>
              <PostcardRenderer theme={theme} haiku={haiku} fontScale={fontScale} />
            </div>
          </div>
        </figure>
        <figure className={styles.pane}>
          <figcaption>Generated PNG</figcaption>
          <div className={styles.frame} style={previewStyle}>
            {generated ? (
              // eslint-disable-next-line @next/next/no-img-element -- object URL preview
              <img
                className={styles.png}
                src={generated.url}
                alt="Generated postcard"
                data-testid="postcard-png"
                onLoad={(event) =>
                  setPngSize(`${event.currentTarget.naturalWidth}×${event.currentTarget.naturalHeight}`)
                }
              />
            ) : (
              <p className={styles.placeholder}>Not generated yet</p>
            )}
          </div>
        </figure>
      </div>
    </div>
  );
}

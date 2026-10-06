"use client";

import { useState } from "react";
import {
  generatePostcardImages,
  type GeneratePostcardImagesInput,
} from "@/components/Postcard/generatePostcardImages";
import { downloadPostcardBlob, postcardFilename } from "@/components/Postcard/postcardDevDownload";
import styles from "./DevPostcardPage.module.css";

type BothSidesResult = { frontKb: number; backKbs: number[]; ms: number };

const toKb = (blob: Blob) => Math.round(blob.size / 1024);

/** Dev-only: run the same generation the share email uses (front + a back per recipient), then download all. */
export function DevPostcardGenerateBoth(input: GeneratePostcardImagesInput) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BothSidesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const started = performance.now();
      const { front, backs } = await generatePostcardImages(input);
      setResult({
        frontKb: toKb(front),
        backKbs: backs.map((back) => toKb(back.blob)),
        ms: Math.round(performance.now() - started),
      });
      downloadPostcardBlob(front, postcardFilename(input.haiku.id, "front"));
      backs.forEach((back, index) => {
        downloadPostcardBlob(back.blob, postcardFilename(`${input.haiku.id}-${index + 1}`, "back"));
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.bothRow}>
      <button type="button" onClick={run} disabled={busy} data-testid="postcard-generate-both">
        {busy ? "Generating…" : "Generate front + back per recipient + download"}
      </button>
      {result ? (
        <span data-testid="postcard-both-meta">
          {`Front ${result.frontKb} KB · ${result.backKbs.length} backs (${result.backKbs.join(", ")} KB) · same size verified · ${result.ms} ms`}
        </span>
      ) : null}
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}

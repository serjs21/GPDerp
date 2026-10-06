"use client";

import { useState } from "react";
import {
  generatePostcardImages,
  type GeneratePostcardImagesInput,
} from "@/components/Postcard/generatePostcardImages";
import { downloadPostcardBlob, postcardFilename } from "@/components/Postcard/postcardDevDownload";
import styles from "./DevPostcardPage.module.css";

type BothSidesResult = { frontKb: number; backKb: number; ms: number };

/** Dev-only: run the same two-sided generation the share email uses, then download both. */
export function DevPostcardGenerateBoth(input: GeneratePostcardImagesInput) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BothSidesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const started = performance.now();
      const { front, back } = await generatePostcardImages(input);
      setResult({
        frontKb: Math.round(front.size / 1024),
        backKb: Math.round(back.size / 1024),
        ms: Math.round(performance.now() - started),
      });
      downloadPostcardBlob(front, postcardFilename(input.haiku.id, "front"));
      downloadPostcardBlob(back, postcardFilename(input.haiku.id, "back"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.bothRow}>
      <button type="button" onClick={run} disabled={busy} data-testid="postcard-generate-both">
        {busy ? "Generating both…" : "Generate both sides + download"}
      </button>
      {result ? (
        <span data-testid="postcard-both-meta">
          {`Front ${result.frontKb} KB · Back ${result.backKb} KB · same size verified · ${result.ms} ms`}
        </span>
      ) : null}
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type ChunkStreamProps = {
  /** Full text to stream */
  text: string;

  /** Average ms between chunk commits */
  intervalMs?: number;

  /** Randomness added/subtracted to interval */
  jitterMs?: number;

  /** Words per chunk (min/max) */
  wordsPerChunk?: { min: number; max: number };

  /** Auto start on mount */
  startOnMount?: boolean;

  /** Render as <pre> by default; you can pass className/style */
  className?: string;
  style?: React.CSSProperties;

  /** Called once when streaming completes */
  onDone?: () => void;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ChunkyText = ({
  text,
  intervalMs = 70,
  jitterMs = 40,
  wordsPerChunk = { min: 1, max: 4 },
  startOnMount = true,
  className,
  style,
  onDone,
}: ChunkStreamProps) => {
  const tokens = useMemo(() => {
    // keep whitespace/newlines by splitting on spaces but preserving \n inside tokens
    // simplest: split on spaces; newlines remain in tokens and render in <pre>.
    return text.split(" ").filter(Boolean);
  }, [text]);

  const [out, setOut] = useState("");
  const idxRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const stop = () => {
    runningRef.current = false;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const start = () => {
    if (runningRef.current) return;
    runningRef.current = true;

    const tick = () => {
      if (!runningRef.current) return;

      const i = idxRef.current;
      if (i >= tokens.length) {
        stop();
        onDone?.();
        return;
      }

      const n = randInt(
        clamp(wordsPerChunk.min, 1, 50),
        clamp(wordsPerChunk.max, wordsPerChunk.min, 80)
      );

      const next = tokens.slice(i, i + n).join(" ");
      idxRef.current = i + n;

      setOut((prev) => (prev ? `${prev} ${next}` : next));

      const delay = Math.max(0, intervalMs + randInt(-jitterMs, jitterMs));
      timerRef.current = window.setTimeout(tick, delay);
    };

    tick();
  };

  const reset = () => {
    stop();
    idxRef.current = 0;
    setOut("");
  };

  useEffect(() => {
    reset();
    if (startOnMount) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, startOnMount]);

  return (
    <div>
      <pre
        className={className}
        style={{
          whiteSpace: "pre-wrap",
          margin: 0,
          ...style,
        }}
      >
        {out}
        {/* subtle caret */}
        {runningRef.current && <span style={{ opacity: 0.7 }}>▍</span>}
      </pre>

      {/* optional controls; delete if you don't want them */}
      {/* <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
        <button onClick={reset}>Reset</button>
      </div> */}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type ChunkStreamProps = {
  /** Full text to stream */
  text: string;

  /** Total animation time (ms) for full text */
  totalMs?: number;

  /** Auto start on mount */
  startOnMount?: boolean;

  /** Render as <span>; you can pass className/style */
  className?: string;
  style?: React.CSSProperties;

  /** Called once when streaming completes */
  onDone?: () => void;
};

export const StreamText = ({
  text,
  totalMs = 1000,
  startOnMount = true,
  className,
  style,
  onDone,
}: ChunkStreamProps) => {
  const chars = useMemo(() => Array.from(text), [text]);

  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const doneRef = useRef(false);

  const stop = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const reset = () => {
    stop();
    doneRef.current = false;
    setCount(0);
  };

  const start = () => {
    stop();
    startRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(1, elapsed / Math.max(1, totalMs));
      const nextCount = Math.floor(progress * chars.length);

      setCount((prev) => (nextCount > prev ? nextCount : prev));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
        stop();
      }
    };

    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    reset();
    if (startOnMount) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, startOnMount, totalMs]);

  const visible = chars.slice(0, count);

  return (
    <span
      className={className}
      style={{
        whiteSpace: "pre-wrap",
        margin: 0,
        fontWeight: "bold",
        ...style,
      }}
    >
      {/* Underline layer: grows with revealed characters */}
      <span className="ct-wrap">
        {visible.map((ch, i) => (
          <span
            key={i}
            className="ct-ch"
            style={{
              ["--d" as any]: `${(i / (Math.max(1, chars.length) * 100 )) * (totalMs * 10)}ms`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </span>

      {count < chars.length && <span style={{ opacity: 0.7 }}>▍</span>}

      <style>{`
        .ct-wrap { display: inline; }

        /* Each char gets an underline that “draws in” */
        .ct-ch{
          position: relative;
          display: inline-block;
        }

        .ct-ch::after{
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -0.08em;
          height: 0.12em;
          background: currentColor;

          transform-origin: left center;
          transform: scaleX(0);
          opacity: 0.9;

          animation: ct-underline 140ms ease-out forwards;
          animation-delay: var(--d, 0ms);
        }

        @keyframes ct-underline {
          to { transform: scaleX(1); }
        }

        @media (prefers-reduced-motion: reduce){
          .ct-ch::after { animation: none; transform: scaleX(1); }
        }
      `}</style>
    </span>
  );
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { GoldenAgeTitle } from "@/components/GoldenAgeTitle";
import { HtmlLoader } from "./index";
import { HtmlLoaderExit } from "./HtmlLoaderExit";

type TransitionDemoProps = {
  /** Reveal on its own after this delay; 0 waits for the Reveal button. */
  revealAfterMs: number;
};

const CONTENT_STYLE = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",
  minHeight: "100vh",
  padding: "2rem",
  boxSizing: "border-box",
  background: "linear-gradient(180deg, #171a33 0%, #312b4a 54%, #665064 100%)",
  color: "#efe2bc",
  fontFamily: "var(--font-comic-label), Bangers, sans-serif",
  fontSize: "1.5rem",
  letterSpacing: "0.04em",
} as const;

const CONTROLS_STYLE = {
  position: "fixed",
  left: "1rem",
  bottom: "1rem",
  zIndex: 10001,
  display: "flex",
  gap: "0.5rem",
} as const;

const BUTTON_STYLE = {
  padding: "0.45rem 0.9rem",
  border: "3px solid #111",
  background: "#fff",
  font: "700 0.9rem/1 sans-serif",
  cursor: "pointer",
} as const;

const clearLoaderExited = () => {
  delete document.documentElement.dataset.loaderExited;
};

/**
 * The server-rendered loader over sample app content, removed by the real HtmlLoaderExit (react-pageflip).
 * In the app, `revealed` comes from useMarkHydrated once the first view's art is ready.
 */
function TransitionDemo({ revealAfterMs }: TransitionDemoProps) {
  const [revealed, setRevealed] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => clearLoaderExited, []);

  useEffect(() => {
    if (revealAfterMs <= 0) return;
    const timer = window.setTimeout(() => setRevealed(true), revealAfterMs);
    return () => window.clearTimeout(timer);
  }, [revealAfterMs, run]);

  const replay = () => {
    clearLoaderExited();
    setRevealed(false);
    setRun((value) => value + 1);
  };

  return (
    <>
      <main style={CONTENT_STYLE}>
        <div style={{ width: "19rem", maxWidth: "100%" }}>
          <GoldenAgeTitle />
        </div>
        <p style={{ margin: 0 }}>App content, uncovered by the page turn</p>
      </main>
      <HtmlLoader key={`loader-${run}`} />
      <HtmlLoaderExit key={`exit-${run}`} revealed={revealed} />
      <div style={CONTROLS_STYLE}>
        <button type="button" style={BUTTON_STYLE} onClick={() => setRevealed(true)} disabled={revealed}>
          Reveal
        </button>
        <button type="button" style={BUTTON_STYLE} onClick={replay}>
          Replay
        </button>
      </div>
    </>
  );
}

const meta = {
  title: "Loaders/HtmlLoaderExit",
  component: TransitionDemo,
  parameters: { layout: "fullscreen" },
  args: { revealAfterMs: 1500 },
  argTypes: {
    revealAfterMs: { control: { type: "range", min: 0, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof TransitionDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Loader shows for 1.5s, then the page turns away onto the content. Replay to watch it again. */
export const PageTurnToContent: Story = {};

/** Holds the loader until you press Reveal. */
export const ManualReveal: Story = {
  args: { revealAfterMs: 0 },
};

/**
 * With "prefers-reduced-motion: reduce" (OS setting, or DevTools > Rendering) the loader is removed
 * without the turn.
 */
export const ReducedMotion: Story = {
  parameters: {
    docs: { description: { story: "Enable reduced motion in the OS or DevTools to see the instant removal." } },
  },
};

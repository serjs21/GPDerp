import { AnimatePresence, motion } from "motion/react";
import { Sun } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BlackHoleWhirlpool } from "../../../animations/BlackHoleWhirlpool/BlackHoleWhirlpool";
import {
  BLACK_HOLE_INSIDE_EASE,
  BLACK_HOLE_ROTATION_SPEED,
  TEXT_CROSSFADE_S,
} from "../AuthDualityToggle/authToggleMotion";

type AuthSide = "login" | "register";
type SettledMode = "text" | "icon";
type DisplayMode = "text" | "textExit" | "icon";

const SYMBOL: Record<AuthSide, ReactNode> = {
  login: "☾",
  register: <Sun size="1em" strokeWidth={2.25} aria-hidden focusable={false} />,
};

const HOVER_TEXT_GLOW_STRONG =
  "0 0 0.9em color-mix(in srgb, #ffffff 70%, transparent), -0.52em 0 0.95em color-mix(in srgb, #ffffff 56%, transparent), 0.52em 0 0.95em color-mix(in srgb, #ffffff 56%, transparent), 0 0 0.52em color-mix(in srgb, #ffffff 82%, transparent)";
const HOVER_TEXT_GLOW_SOFT =
  "0 0 0.72em color-mix(in srgb, #ffffff 52%, transparent), -0.4em 0 0.78em color-mix(in srgb, #ffffff 44%, transparent), 0.4em 0 0.78em color-mix(in srgb, #ffffff 44%, transparent), 0 0 0.4em color-mix(in srgb, #ffffff 58%, transparent)";
const HOVER_TEXT_FILTER_STRONG =
  "brightness(1.084) drop-shadow(0 0 0.55em color-mix(in srgb, #ffffff 38%, transparent))";
const HOVER_TEXT_FILTER_SOFT =
  "brightness(1.048) drop-shadow(0 0 0.42em color-mix(in srgb, #ffffff 24%, transparent))";
const GLOW_EASE_IN = [0.38, 0, 0.9, 1] as const;
const ICON_GLOW_STRONG =
  "0 0 0.38em color-mix(in srgb, #fff 70%, transparent), 0 0 0.8em color-mix(in srgb, var(--accent-red) 50%, transparent)";
const ICON_GLOW_SOFT =
  "0 0 0.22em color-mix(in srgb, #fff 52%, transparent), 0 0 0.5em color-mix(in srgb, var(--accent-red) 34%, transparent)";
const ICON_FILTER_STRONG = "drop-shadow(0 0 0.24em color-mix(in srgb, #fff 44%, transparent)) brightness(1.08)";
const ICON_FILTER_SOFT = "drop-shadow(0 0 0.14em color-mix(in srgb, #fff 28%, transparent)) brightness(1)";

type TextToIconProps = {
  side: AuthSide;
  label: string;
  dominant: boolean;
  targetMode: SettledMode;
  canShowText: boolean;
  transitionDelayMs: number;
  transitionDurationMs: number;
  transitionKey: number;
};

export function TextToIcon({
  side,
  label,
  dominant,
  targetMode,
  canShowText,
  transitionDelayMs,
  transitionDurationMs,
  transitionKey,
}: TextToIconProps) {
  const symbol = SYMBOL[side];
  const [mode, setMode] = useState<DisplayMode>("text");
  const [whirlpoolKey, setWhirlpoolKey] = useState(0);
  const modeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitLockedRef = useRef(false);
  const queuedTargetRef = useRef<SettledMode | null>(null);

  useEffect(() => {
    if (exitLockedRef.current) {
      queuedTargetRef.current = targetMode;
      return;
    }

    if (modeTimerRef.current) clearTimeout(modeTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    modeTimerRef.current = null;
    exitTimerRef.current = null;

    if (targetMode === "icon" && mode === "text") {
      modeTimerRef.current = setTimeout(() => {
        setWhirlpoolKey((prev) => prev + 1);
        setMode("textExit");
        exitLockedRef.current = true;
        modeTimerRef.current = null;
        exitTimerRef.current = setTimeout(() => {
          setMode("icon");
          exitLockedRef.current = false;
          const queuedTarget = queuedTargetRef.current;
          queuedTargetRef.current = null;
          if (queuedTarget === "text") setMode("text");
          exitTimerRef.current = null;
        }, Math.max(1, transitionDurationMs));
      }, transitionDelayMs);
      return;
    }

    if (targetMode === "text" && mode === "icon") {
      modeTimerRef.current = setTimeout(() => {
        setMode("text");
        modeTimerRef.current = null;
      }, transitionDelayMs);
    }
  }, [mode, targetMode, transitionDelayMs, transitionDurationMs, transitionKey]);

  useEffect(
    () => () => {
      if (modeTimerRef.current) clearTimeout(modeTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    },
    [],
  );

  const isTextExit = mode === "textExit";
  const showText = (mode === "text" && canShowText) || isTextExit;
  const iconLeavingToText = mode === "icon" && targetMode === "text";

  return (
    <span className="syl-anime-content">
      <div className="syl-anime-wash-wrap" aria-hidden style={{ opacity: isTextExit ? 1 : 0 }}>
        <BlackHoleWhirlpool
          duration={Math.max(1, transitionDurationMs)}
          rotationSpeed={BLACK_HOLE_ROTATION_SPEED}
          insideTransformEaseInPower={BLACK_HOLE_INSIDE_EASE}
          centerMode="container"
          active={isTextExit}
          playKey={whirlpoolKey}
        >
          {label}
        </BlackHoleWhirlpool>
      </div>

      <AnimatePresence initial={false} mode="sync">
        {showText ? (
          !isTextExit ? (
            <motion.span
              key={`${side}-text`}
              className="syl-anime-label"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{
                opacity: 1,
                scale: dominant ? 1.04 : 1,
                letterSpacing: dominant ? "0.01em" : "0.03em",
                textShadow: dominant ? ["none", HOVER_TEXT_GLOW_STRONG, HOVER_TEXT_GLOW_SOFT] : "none",
                filter: dominant ? ["brightness(1)", HOVER_TEXT_FILTER_STRONG, HOVER_TEXT_FILTER_SOFT] : "brightness(1)",
              }}
              transition={{
                type: "tween",
                duration: TEXT_CROSSFADE_S,
                ease: "linear",
                textShadow: { duration: 0.55, ease: GLOW_EASE_IN, times: [0, 0.45, 1] },
                filter: { duration: 0.55, ease: GLOW_EASE_IN, times: [0, 0.45, 1] },
              }}
            >
              <span className={`syl-anime-label-glyph syl-anime-label-glyph-${side}`}>{label}</span>
            </motion.span>
          ) : null
        ) : (
          <motion.span
            key={`${side}-icon`}
            className={`syl-anime-symbol syl-anime-symbol-${side}${iconLeavingToText ? " syl-anime-symbol-under" : ""}`}
            initial={{ opacity: 1, scale: 0 }}
            animate={{
              opacity: 1,
              scale: [0, 0, 1],
              textShadow: [ICON_GLOW_SOFT, ICON_GLOW_STRONG, ICON_GLOW_SOFT],
              filter: [ICON_FILTER_SOFT, ICON_FILTER_STRONG, ICON_FILTER_SOFT],
            }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
              type: "tween",
              duration: TEXT_CROSSFADE_S,
              ease: "easeOut",
              opacity: { duration: TEXT_CROSSFADE_S, ease: "easeOut" },
            }}
            aria-hidden
          >
            <span className={`syl-anime-symbol-glyph syl-anime-symbol-glyph-${side}`}>{symbol}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

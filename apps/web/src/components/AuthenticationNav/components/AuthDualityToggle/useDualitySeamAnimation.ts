import { animate } from "animejs";
import { useCallback, useEffect, useRef, type RefObject } from "react";

const RESIZE_ANIME_EASE = "in(2)";
const IDLE_AMP = 0;
const HOVER_AMP = 4.5;

function seamPath(splitX: number, amp: number, height: number) {
  const phase = Math.PI * 0.5;
  const controlOneX = splitX - 13 + Math.sin(phase) * amp;
  const controlTwoX = splitX + 13 + Math.cos(phase * 0.95) * amp;
  return `M ${splitX} 0 C ${controlOneX} ${Math.round(height * 0.27)}, ${controlTwoX} ${Math.round(height * 0.73)}, ${splitX} ${height}`;
}

function yingPath(splitX: number, amp: number, height: number) {
  const topY = -2;
  const bottomY = height + 2;
  const phase = Math.PI * 0.5;
  const controlOneX = splitX - 13 + Math.sin(phase) * amp;
  const controlTwoX = splitX + 13 + Math.cos(phase * 0.95) * amp;
  return `M -2 ${topY} H ${splitX} C ${controlOneX} ${Math.round(height * 0.27)}, ${controlTwoX} ${Math.round(height * 0.73)}, ${splitX} ${bottomY} H -2 Z`;
}

type UseDualitySeamAnimationParams = {
  height: number;
  loginWidth: number;
  resizeDurationSeconds: number;
  hoveredSide: "login" | "register" | null;
  reduceMotion: boolean | null;
  seamRef: RefObject<SVGPathElement | null>;
  yingRef: RefObject<SVGPathElement | null>;
};

export function useDualitySeamAnimation({
  height,
  loginWidth,
  resizeDurationSeconds,
  hoveredSide,
  reduceMotion,
  seamRef,
  yingRef,
}: UseDualitySeamAnimationParams) {
  const modelRef = useRef({ amp: IDLE_AMP, splitX: loginWidth });
  const ampAnimationRef = useRef<{ cancel: () => void } | null>(null);

  const paintFrame = useCallback(
    (splitX: number, amp: number) => {
      if (seamRef.current) seamRef.current.setAttribute("d", seamPath(splitX, amp, height));
      if (yingRef.current) yingRef.current.setAttribute("d", yingPath(splitX, amp, height));
    },
    [height, seamRef, yingRef],
  );

  useEffect(() => {
    ampAnimationRef.current?.cancel();

    if (reduceMotion) {
      const targetAmplitude = hoveredSide ? HOVER_AMP : IDLE_AMP;
      modelRef.current = { amp: targetAmplitude, splitX: loginWidth };
      paintFrame(loginWidth, targetAmplitude);
      return;
    }

    const targetAmplitude = hoveredSide ? HOVER_AMP : IDLE_AMP;
    const animationModel = { amp: modelRef.current.amp, splitX: modelRef.current.splitX };
    ampAnimationRef.current = animate(animationModel, {
      amp: targetAmplitude,
      splitX: loginWidth,
      duration: Math.max(100, Math.round(resizeDurationSeconds * 1000)),
      ease: RESIZE_ANIME_EASE,
      onUpdate: () => {
        modelRef.current.amp = animationModel.amp;
        modelRef.current.splitX = animationModel.splitX;
        paintFrame(animationModel.splitX, animationModel.amp);
      },
    });

    return () => {
      ampAnimationRef.current?.cancel();
    };
  }, [hoveredSide, reduceMotion, loginWidth, paintFrame, resizeDurationSeconds]);
}

import { animate } from "animejs";
import { useLayoutEffect, useRef } from "react";
import "./black-hole-whirlpool.css";
import {
  BASE_SPIN_TURNS,
  type CharacterItem,
  type CharacterLayout,
  SPIRAL_SWEEP_RAD,
} from "./blackHoleConstants";
import { prepareCharacterItems } from "./prepareCharacterItems";

type BlackHoleWhirlpoolProps = {
  duration: number;
  rotationSpeed?: number;
  insideTransformEaseInPower?: number;
  centerMode?: "content" | "container";
  active?: boolean;
  playKey?: number;
  children: React.ReactNode;
};

export function BlackHoleWhirlpool({
  duration,
  rotationSpeed = 1,
  insideTransformEaseInPower = 2,
  centerMode = "content",
  active = true,
  playKey = 0,
  children,
}: BlackHoleWhirlpoolProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<CharacterItem[]>([]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const characterItems: CharacterItem[] = prepareCharacterItems(content);
    charsRef.current = characterItems;
  }, []);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const content = contentRef.current;
    if (!host || !content) return;
    const items = charsRef.current;
    if (items.length === 0) return;
    if (!active) return;

    const hostRect = host.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const baseWidth = Math.max(1, hostRect.width);
    const centerX =
      centerMode === "container" ? hostRect.width * 0.5 : contentRect.left - hostRect.left + contentRect.width * 0.5;
    const centerY =
      centerMode === "container" ? hostRect.height * 0.5 : contentRect.top - hostRect.top + contentRect.height * 0.5;
    const initialWidth = contentRect.width;
    const initialHeight = contentRect.height;
    const squareSize = Math.min(initialWidth, initialHeight);
    const squareHalf = squareSize * 0.5;
    const widthDelta = Math.max(0, initialWidth - squareSize);
    const heightDelta = Math.max(0, initialHeight - squareSize);
    const layout: CharacterLayout[] = items.map((item) => {
      const rect = item.el.getBoundingClientRect();
      const x = rect.left - hostRect.left + rect.width * 0.5;
      const y = rect.top - hostRect.top + rect.height * 0.5;
      const halfW = rect.width * 0.5;
      const halfH = rect.height * 0.5;
      return { item, x, y, halfW, halfH };
    });
    const enteredPhaseByIndex = new Map<number, number>();
    const model = { value: baseWidth };
    host.style.setProperty("--black-hole-width", `${baseWidth}px`);
    host.style.setProperty("--black-hole-phase", "0");
    host.style.setProperty("--black-hole-intensity", "0.25");
    host.style.setProperty("--black-hole-box-width", `${initialWidth.toFixed(2)}px`);
    host.style.setProperty("--black-hole-box-height", `${initialHeight.toFixed(2)}px`);

    const timeline = animate(model, {
      value: 0,
      duration: Math.max(120, Math.round(duration)),
      ease: "linear",
      onUpdate: () => {
        const ratio = Math.max(0, Math.min(1, model.value / baseWidth));
        const phase = 1 - ratio;
        const resizeProgress = phase;
        host.style.setProperty("--black-hole-width", `${model.value}px`);
        host.style.setProperty("--black-hole-phase", phase.toFixed(4));
        host.style.setProperty("--black-hole-intensity", (0.25 + phase * 0.75).toFixed(4));
        const currentWidth = initialWidth - widthDelta * resizeProgress;
        const currentHeight = initialHeight - heightDelta * resizeProgress;
        host.style.setProperty("--black-hole-box-width", `${currentWidth.toFixed(2)}px`);
        host.style.setProperty("--black-hole-box-height", `${currentHeight.toFixed(2)}px`);
        const resizeScaleX = initialWidth <= 0 ? 1 : currentWidth / initialWidth;
        const resizeScaleY = initialHeight <= 0 ? 1 : currentHeight / initialHeight;
        const speed = Math.max(0.05, rotationSpeed);
        for (const entry of layout) {
          const { item, x, y, halfW, halfH } = entry;
          const offsetX0 = x - centerX;
          const offsetY0 = y - centerY;
          const resizedX = centerX + offsetX0 * resizeScaleX;
          const resizedY = centerY + offsetY0 * resizeScaleY;
          const resizeTx = resizedX - x;
          const resizeTy = resizedY - y;

          const offsetX = resizedX - centerX;
          const offsetY = resizedY - centerY;
          const startRadius = Math.max(1, Math.hypot(offsetX, offsetY));
          const startAngle = Math.atan2(offsetY, offsetX);
          const radiusJitter = 1 + (item.seed - 0.5) * 0.12;
          const touchesSquareNow =
            Math.abs(resizedX - centerX) <= squareHalf + halfW && Math.abs(resizedY - centerY) <= squareHalf + halfH;
          const enteredAt = enteredPhaseByIndex.get(item.index);
          if (touchesSquareNow && enteredAt === undefined) {
            enteredPhaseByIndex.set(item.index, phase);
          }
          const startPhase = enteredAt ?? phase;
          const cycleLocal = Math.max(0, Math.min(1, (phase - startPhase) / Math.max(0.0001, 1 - startPhase)));
          if (!touchesSquareNow) {
            const outsideDx = Math.max(0, Math.abs(resizedX - centerX) - squareHalf);
            const outsideDy = Math.max(0, Math.abs(resizedY - centerY) - squareHalf);
            const outsideDistance = Math.max(outsideDx, outsideDy);
            const closenessToSquare = 1 - Math.min(1, outsideDistance / Math.max(1, squareHalf));
            const preEntryScale = 1 - 0.25 * closenessToSquare;
            item.el.style.transform = `translate(${resizeTx.toFixed(2)}px, ${resizeTy.toFixed(2)}px) scaleX(${preEntryScale.toFixed(3)}) scaleY(${preEntryScale.toFixed(3)})`;
            item.el.style.opacity = "1";
            item.el.style.filter = "none";
            continue;
          }
          const local = Math.pow(cycleLocal, Math.max(1, insideTransformEaseInPower));
          const arcBias = (item.seed - 0.5) * SPIRAL_SWEEP_RAD * local;
          const spinAngle = BASE_SPIN_TURNS * Math.PI * 2 * local * speed;
          const angle = startAngle + arcBias + spinAngle;
          const radiusFalloff = Math.pow(1 - local, 1.24);
          const radius = startRadius * radiusFalloff * radiusJitter;
          const targetX = centerX + Math.cos(angle) * radius;
          const targetY = centerY + Math.sin(angle) * radius * 0.72;
          const tx = targetX - x;
          const ty = targetY - y;
          const edgeDistance = Math.max(Math.abs(offsetX), Math.abs(offsetY)) / Math.max(1, squareHalf);
          const baseScale = Math.max(0, 1 - local);
          const edgeTaper = Math.max(0, 1 - edgeDistance * local * 0.62);
          const scaleX = Math.max(0, baseScale * edgeTaper);
          const scaleY = Math.max(0, baseScale);
          const blur = 3 * local;

          item.el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scaleX(${scaleX.toFixed(3)}) scaleY(${scaleY.toFixed(3)})`;
          item.el.style.opacity = "1";
          item.el.style.filter = `blur(${blur.toFixed(2)}px)`;
        }
      },
    });

    return () => {
      timeline.cancel();
      host.style.setProperty("--black-hole-box-width", `${initialWidth.toFixed(2)}px`);
      host.style.setProperty("--black-hole-box-height", `${initialHeight.toFixed(2)}px`);
      for (const item of items) {
        item.el.style.transform = "translate(0px, 0px) scaleX(1) scaleY(1)";
        item.el.style.opacity = "1";
        item.el.style.filter = "none";
      }
    };
  }, [active, centerMode, duration, insideTransformEaseInPower, playKey, rotationSpeed]);

  return (
    <div ref={hostRef} className="black-hole-root">
      <div className="black-hole-mask" aria-hidden />
      <div ref={contentRef} className="black-hole-content">
        {children}
      </div>
    </div>
  );
}

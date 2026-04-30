import { animate } from "animejs";
import { useEffect, useRef } from "react";
import "./wash-in-sea.css";

export type WashDirection = "left" | "right" | "up" | "down";

type WashInSeaProps = {
  direction: WashDirection;
  duration: number;
  children: React.ReactNode;
};

type Vec2 = { x: number; y: number };

const CHAR_BASE_TRAVEL = 56;

function directionVector(direction: WashDirection): Vec2 {
  if (direction === "left") return { x: -1, y: 0 };
  if (direction === "right") return { x: 1, y: 0 };
  if (direction === "up") return { x: 0, y: -1 };
  return { x: 0, y: 1 };
}

export function WashInSea({ direction, duration, children }: WashInSeaProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const charDataRef = useRef<Array<{ el: HTMLSpanElement; seed: number; index: number; total: number }>>([]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Recreate split structure each run so the same component can replay by remounting.
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (node.nodeValue && node.nodeValue.trim().length > 0) textNodes.push(node);
    }

    let globalIndex = 0;
    const chars: Array<{ el: HTMLSpanElement; seed: number; index: number; total: number }> = [];

    for (const textNode of textNodes) {
      const value = textNode.nodeValue ?? "";
      const fragment = document.createDocumentFragment();
      for (const ch of value) {
        if (ch === " ") {
          fragment.appendChild(document.createTextNode(ch));
          continue;
        }
        const span = document.createElement("span");
        span.className = "wash-sea-char";
        span.textContent = ch;
        fragment.appendChild(span);
        chars.push({ el: span, seed: Math.random(), index: globalIndex, total: 0 });
        globalIndex += 1;
      }
      textNode.parentNode?.replaceChild(fragment, textNode);
    }

    const total = chars.length;
    chars.forEach((item) => {
      item.total = total;
    });
    charDataRef.current = chars;
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const items = charDataRef.current;
    if (items.length === 0) return;

    const baseWidth = Math.max(1, host.getBoundingClientRect().width);
    const vec = directionVector(direction);
    const widthModel = { value: baseWidth };

    const timeline = animate(widthModel, {
      value: 0,
      duration: Math.max(120, Math.round(duration)),
      ease: "linear",
      onUpdate: () => {
        const ratio = Math.max(0, Math.min(1, widthModel.value / baseWidth));
        const phase = 1 - ratio;
        host.style.setProperty("--wash-width", `${widthModel.value}px`);
        host.dataset.direction = direction;

        for (const item of items) {
          const norm = item.total <= 1 ? 0 : item.index / (item.total - 1);
          const front = direction === "left" || direction === "up" ? 1 - norm : norm;
          const start = Math.max(0, front * 0.52 - 0.06 + item.seed * 0.08);
          const local = Math.max(0, Math.min(1, (phase - start) / (1 - start)));
          const travel = CHAR_BASE_TRAVEL * (0.8 + item.seed * 0.6);
          const sway = Math.sin((phase + item.seed) * 18) * 4 * local;
          const tx = vec.x * travel * local + (vec.y !== 0 ? sway : 0);
          const ty = vec.y * travel * local + (vec.x !== 0 ? sway : 0);
          const rot = (item.seed - 0.5) * 36 * local;
          const scale = 1 - local * 0.42;
          const opacity = 1 - local;
          const blur = 2.2 * local;

          item.el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          item.el.style.opacity = opacity.toFixed(3);
          item.el.style.filter = `blur(${blur.toFixed(2)}px)`;
        }
      },
    });

    return () => {
      timeline.cancel();
    };
  }, [direction, duration]);

  return (
    <div ref={hostRef} className="wash-sea-root" data-direction={direction}>
      <div className="wash-sea-clip" aria-hidden />
      <div ref={contentRef} className="wash-sea-content">
        {children}
      </div>
    </div>
  );
}

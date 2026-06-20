export const GENERATING_HAIKU_CARD_MOTION = {
  initial: { opacity: 0, x: -100, y: -20, minHeight: 0, height: 0 },
  animate: { opacity: 1, x: 0, y: 0, minHeight: "185px", height: "fit-content" },
  transition: { duration: 2, ease: [0.22, 1, 0.36, 1] as const },
} as const;

/** Keep successive rotations within ±180° of the previous value (shortest turn). */
export function unwrapRotationDeg(previousDeg: number, targetDeg: number) {
  let next = targetDeg;
  while (next - previousDeg > 180) next -= 360;
  while (next - previousDeg < -180) next += 360;
  return next;
}

export function styleNavigationWheelClassNames(
  styles: Record<string, string>,
  variant: "panel" | "trigger",
  interactive: boolean,
  className: string | undefined,
) {
  const variantClass = variant === "trigger" ? styles.trigger : styles.panel;
  return {
    rootClass: [styles.root, variantClass, className].filter(Boolean).join(" "),
    faceClass: [styles.face, interactive ? styles.interactive : null].filter(Boolean).join(" "),
  };
}

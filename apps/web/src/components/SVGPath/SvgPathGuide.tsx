import type { SvgPathGuideProps } from "./SVGPath.types";
import styles from "./SVGPath.module.css";

/** Debug guide: the split path SVG drawn under the lanterns once it has loaded. */
export function SvgPathGuide({ splitPath }: SvgPathGuideProps) {
  if (!splitPath) return null;
  return (
    <svg
      className={styles.guide}
      viewBox={`0 0 ${splitPath.parsed.viewBox.width} ${splitPath.parsed.viewBox.height}`}
      preserveAspectRatio="none"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: splitPath.guideInner }}
    />
  );
}

import type { CSSProperties, ReactNode } from "react";
import styles from "./Lantern3D.module.css";

/** Native wall PNG aspect (374×333). */
export const WALL_ASSET_ASPECT = 333 / 374;

export const DEFAULT_SIZE = 320;
export const DEFAULT_ROTATION_X = -8;
export const DEFAULT_ROTATION_Y = 25;

export type Lantern3DProps = {
  baseSrc: string;
  wallSrc: string;
  /** Base / footprint width in px (square: width === depth). */
  size?: number;
  /** Wall plane height in px; defaults from wall asset aspect. */
  height?: number;
  rotationX?: number;
  rotationY?: number;
  children?: ReactNode;
  className?: string;
};

const WALLS = [
  { id: "front", className: styles.wallFront, rotateY: 0 },
  { id: "right", className: styles.wallRight, rotateY: 90 },
  { id: "back", className: styles.wallBack, rotateY: 180 },
  { id: "left", className: styles.wallLeft, rotateY: -90 },
] as const;

/**
 * Fake 3D lantern from flat image planes (CSS transforms only).
 * Square footprint: four walls + base bottom + optional inner content.
 */
export function Lantern3D({
  baseSrc,
  wallSrc,
  size = DEFAULT_SIZE,
  height,
  rotationX = DEFAULT_ROTATION_X,
  rotationY = DEFAULT_ROTATION_Y,
  children,
  className,
}: Lantern3DProps) {
  const width = size;
  const depth = size;
  const wallHeight = height ?? size * WALL_ASSET_ASPECT;
  const halfDepth = depth / 2;
  const halfHeight = wallHeight / 2;

  const sceneStyle = {
    "--lantern-width": `${width}px`,
    "--lantern-depth": `${depth}px`,
    "--lantern-wall-height": `${wallHeight}px`,
    "--lantern-half-depth": `${halfDepth}px`,
    "--lantern-half-height": `${halfHeight}px`,
  } as CSSProperties;

  const lanternStyle: CSSProperties = {
    transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
  };

  const rootClass = [styles.scene, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} style={sceneStyle}>
      <div className={styles.lantern} style={lanternStyle}>
        {WALLS.map((wall) => (
          <div
            key={wall.id}
            className={`${styles.wall} ${wall.className}`}
            style={{
              backgroundImage: `url(${wallSrc})`,
              transform: `rotateY(${wall.rotateY}deg) translateZ(${halfDepth}px)`,
            }}
            aria-hidden
          />
        ))}

        <div
          className={styles.base}
          style={{
            backgroundImage: `url(${baseSrc})`,
            /* Bottom face: tip into floor plane, push to lantern floor */
            transform: `rotateX(90deg) translateZ(${halfHeight}px)`,
          }}
          aria-hidden
        />

        {children != null ? (
          <div className={styles.content}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}

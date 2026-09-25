type DateGraffitiSprayFilterProps = {
  filterId: string;
  /** Deterministic feTurbulence seed. */
  seed: number;
};

/**
 * Static SVG spray-paint treatment for Flacucho text:
 * solid paint → rough edge → sparse pinholes → near-edge overspray droplets.
 */
export function DateGraffitiSprayFilter({ filterId, seed }: DateGraffitiSprayFilterProps) {
  const edgeSeed = seed;
  const holeSeed = (seed + 17) % 10_000 || 1;
  const spraySeed = (seed + 41) % 10_000 || 1;

  return (
    <filter
      id={filterId}
      x="-15%"
      y="-20%"
      width="130%"
      height="140%"
      filterUnits="objectBoundingBox"
      colorInterpolationFilters="sRGB"
    >
      {/* 1. Subtle high-frequency edge roughening (~1–3px). */}
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.95 1.05"
        numOctaves="2"
        seed={edgeSeed}
        result="edgeNoise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="edgeNoise"
        scale="1.75"
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />

      {/* 2. Sparse pinhole / coverage gaps inside the paint. */}
      <feTurbulence
        type="fractalNoise"
        baseFrequency="1.55 1.7"
        numOctaves="1"
        seed={holeSeed}
        result="holeNoise"
      />
      <feColorMatrix in="holeNoise" type="luminanceToAlpha" result="holeAlpha" />
      <feComponentTransfer in="holeAlpha" result="holeMask">
        {/* Most samples stay transparent; a few become opaque punch-outs. */}
        <feFuncA
          type="discrete"
          tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1"
        />
      </feComponentTransfer>
      <feComposite
        in="displaced"
        in2="holeMask"
        operator="out"
        result="painted"
      />

      {/* 3. Overspray: dilated silhouette → sparse speckles outside the glyph. */}
      <feMorphology
        in="SourceGraphic"
        operator="dilate"
        radius="2.4"
        result="dilatedPaint"
      />
      <feComposite
        in="dilatedPaint"
        in2="SourceAlpha"
        operator="out"
        result="sprayRing"
      />
      <feTurbulence
        type="fractalNoise"
        baseFrequency="1.85 2.05"
        numOctaves="1"
        seed={spraySeed}
        result="sprayNoise"
      />
      <feColorMatrix in="sprayNoise" type="luminanceToAlpha" result="sprayAlpha" />
      <feComponentTransfer in="sprayAlpha" result="spraySparse">
        <feFuncA
          type="discrete"
          tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1"
        />
      </feComponentTransfer>
      <feComposite
        in="sprayRing"
        in2="spraySparse"
        operator="in"
        result="oversprayRaw"
      />
      {/* Soften droplets only — not the main glyph. */}
      <feGaussianBlur
        in="oversprayRaw"
        stdDeviation="0.28"
        result="overspray"
      />

      <feMerge>
        <feMergeNode in="painted" />
        <feMergeNode in="overspray" />
      </feMerge>
    </filter>
  );
}

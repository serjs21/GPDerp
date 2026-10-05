const STRETCH_SVG_PROPS = { preserveAspectRatio: "none" } as const;
const STRETCH_PATH_PROPS = { vectorEffect: "non-scaling-stroke" } as const;

export function stretchSvgProps(stretch: boolean | undefined) {
  return stretch ? STRETCH_SVG_PROPS : undefined;
}

export function stretchPathProps(stretch: boolean | undefined) {
  return stretch ? STRETCH_PATH_PROPS : undefined;
}

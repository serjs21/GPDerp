/** CSS module class keys per coin layer (icon cover vs duality base) and flip phase. */
export const COVER_LAYER_CLASS_KEYS = {
  icon: {
    layer: "layerIcon",
    opening: "layerIconOpening",
    closing: "layerIconClosing",
    open: "layerIconOpen",
  },
  base: {
    layer: "layerBase",
    opening: "layerBaseOpening",
    closing: "layerBaseClosing",
    open: "layerBaseOpen",
  },
} as const;

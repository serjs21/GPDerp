/**
 * Chunk loader for the member Main view. Import this file directly (not the barrel), or the
 * whole view lands back in the eager bundle.
 */
export const loadHaikuDisplay = () => import("./HaikuDisplay").then((mod) => mod.HaikuDisplay);

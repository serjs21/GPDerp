import type { WagTailStaticLoaderProps } from "./WagTailStaticLoader.types";

/** Fills its box; dog and caption scale with the box's width. */
export type WagTailLanternFaceProps = Pick<WagTailStaticLoaderProps, "className"> & {
  /** Shown under the dog and announced as the loading status. */
  caption: string;
};

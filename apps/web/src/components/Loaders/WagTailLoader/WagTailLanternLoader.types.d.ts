import type { WagTailStaticLoaderProps } from "./WagTailStaticLoader.types";

/** Size it with `--wag-lantern-width` (any length, % included) on the className or an ancestor. */
export type WagTailLanternLoaderProps = Pick<WagTailStaticLoaderProps, "className">;

import type { FetchingStaticLoaderProps } from "./FetchingStaticLoader.types";

/** Size it with `--fetching-lantern-width` (any length, % included) on the className or an ancestor. */
export type FetchingLanternLoaderProps = Pick<FetchingStaticLoaderProps, "className">;

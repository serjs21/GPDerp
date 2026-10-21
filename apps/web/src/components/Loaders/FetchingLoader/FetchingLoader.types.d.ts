export type FetchingLoaderProps = {
  className?: string;
  /** Width of the stage (the largest frame canvas); every frame keeps the same drawing scale. */
  widthRem?: number;
  /** How long each frame holds; one loop (1 2 1 3) takes 4 x frameMs. */
  frameMs?: number;
};

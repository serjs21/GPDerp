export type HtmlLoaderPageFlipProps = {
  /** The flip copy now covers the server-rendered loader (or the turn is skipped); hide the original. */
  onShown: () => void;
  /** The page has turned away (or the turn is skipped); unmount the overlay. */
  onDone: () => void;
};

/** What react-pageflip's ref exposes that the exit uses. */
export type HtmlLoaderFlipBookHandle = {
  pageFlip: () => { flipNext: (corner?: "top" | "bottom") => void } | undefined;
};

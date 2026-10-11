export type RegisterFlowProps = {
  onSuccess: () => void;
  showGoogle?: boolean;
  /** Hide in-flow CTA (parent provides ComicPageDialog ctaFooter). */
  hideCta?: boolean;
  onSubmittingChange?: (submitting: boolean) => void;
};

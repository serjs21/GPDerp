export type ErrorFallbackProps = {
  /** Re-renders the failed segment (Next.js error boundary `reset`). */
  onRetry: () => void;
};

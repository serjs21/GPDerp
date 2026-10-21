export type LoadingTextProps = {
  /** Position, size and skew come from the consumer. */
  className?: string;
  /** One dot is added every stepMs (up to three), then the word starts over. */
  stepMs: number;
};

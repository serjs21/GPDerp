/**
 * Dev-only console log of every streamed haiku chunk with time since the request started
 * (first-token latency and gaps between deltas). No-op in production.
 */
export const createHaikuStreamChunkLogger = (
  requestId: string,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): ((chunk: string) => void) => {
  if (nodeEnv === "production") return () => {};
  const startedAt = Date.now();
  return (chunk) => {
    console.log(`[haiku-stream] ${requestId} +${Date.now() - startedAt}ms ${JSON.stringify(chunk)}`);
  };
};

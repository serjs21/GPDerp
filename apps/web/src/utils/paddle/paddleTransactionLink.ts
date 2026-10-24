/** Query parameter Paddle appends to the default payment link (e.g. https://gpderp.party/?_ptxn=txn_…). */
export const PADDLE_TRANSACTION_LINK_PARAM = "_ptxn";

/** True when the page was opened from a Paddle payment link; Paddle.js opens that checkout once initialized. */
export const hasPaddleTransactionLink = (search: string): boolean => {
  const value = new URLSearchParams(search).get(PADDLE_TRANSACTION_LINK_PARAM);
  return Boolean(value?.startsWith("txn_"));
};

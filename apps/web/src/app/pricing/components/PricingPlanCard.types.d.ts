export type PricingPlanCardProps = {
  name: string;
  price: string;
  /** Small line under the price (e.g. "one-time, plus applicable tax"). */
  priceNote?: string;
  detail: string;
  /** Visually emphasized plan. */
  featured?: boolean;
};

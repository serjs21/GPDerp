import type { PricingPlanCardProps } from "./PricingPlanCard.types";
import styles from "../pricing.module.css";

/** One plan: name, price (with an optional note) and what it includes. */
export function PricingPlanCard({ name, price, priceNote, detail, featured }: PricingPlanCardProps) {
  return (
    <section className={featured ? `${styles.plan} ${styles.planFeatured}` : styles.plan} aria-label={name}>
      <h2 className={styles.planName}>{name}</h2>
      <p className={styles.planPrice}>{price}</p>
      {priceNote ? <p className={styles.planPriceNote}>{priceNote}</p> : null}
      <p className={styles.planDetail}>{detail}</p>
    </section>
  );
}

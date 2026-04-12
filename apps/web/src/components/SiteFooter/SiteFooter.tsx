import Link from "next/link";
import styles from "./SiteFooter.module.css";

const PADDLE_BUYER_TERMS = "https://www.paddle.com/legal/checkout-buyer-terms";
const PADDLE_PRIVACY = "https://www.paddle.com/legal/privacy";
const PADDLE_REFUND = "https://www.paddle.com/legal/refund-policy";

function Sep() {
  return <span className={styles.sep} aria-hidden="true">·</span>;
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="Legal policies">
        <Link href="/terms">Terms of Service</Link>
        <Sep />
        <Link href="/privacy">Privacy Policy</Link>
        <Sep />
        <Link href="/refund">Refund Policy</Link>
        <Sep />
        <Link href="/acceptable-use">Acceptable Use</Link>
        <Sep />
        <Link href="/cookies">Cookie Policy</Link>
      </nav>
      <p className={styles.paddle}>
        Payments are processed by{" "}
        <a href={PADDLE_BUYER_TERMS} target="_blank" rel="noopener noreferrer">
          Paddle
        </a>{" "}
        as merchant of record. Paddle&apos;s{" "}
        <a href={PADDLE_REFUND} target="_blank" rel="noopener noreferrer">
          buyer refund policy
        </a>
        ,{" "}
        <a href={PADDLE_BUYER_TERMS} target="_blank" rel="noopener noreferrer">
          checkout terms
        </a>
        , and{" "}
        <a href={PADDLE_PRIVACY} target="_blank" rel="noopener noreferrer">
          privacy notice
        </a>{" "}
        apply at purchase.
      </p>
    </footer>
  );
}

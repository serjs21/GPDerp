"use client";

import Link from "next/link";
import uiStyles from "@/components/ui/ui.module.css";
import styles from "./style.module.css";

export const LoggedOutAuthLinks = () => {
  return (
    <nav className={styles.headerAuthNav}>
      <Link href="/login" className={`${uiStyles.button} ${styles.authNavPill} ${styles.authNavSecondary}`}>
        Login
      </Link>
      <Link href="/register" className={`${uiStyles.button} ${styles.authNavPill} ${uiStyles.buttonPrimary}`}>
        Register
      </Link>
    </nav>
  );
};

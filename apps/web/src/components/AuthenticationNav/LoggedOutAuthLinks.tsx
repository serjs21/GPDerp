"use client";

import { Button } from "@/components/StyledComponents";
import Link from "next/link";
import styles from "./style.module.css";

export const LoggedOutAuthLinks = () => {
  return (
    <nav className={styles.headerAuthNav}>
      <Link href="/login">
        <Button className={styles.authButton}>Login</Button>
      </Link>
      <Link href="/register">
        <Button type="primary" className={styles.authButton}>
          Register
        </Button>
      </Link>
    </nav>
  );
};

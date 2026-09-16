"use client";

import Image from "next/image";
import Link from "next/link";
import brandMark from "@/assets/brand/logo-source.png";
import styles from "./BeamMeUpScotty.module.css";

/** Home control: brand mark navigation to `/`. */
export const BeamMeUpScotty = () => {
  return (
    <Link href="/" prefetch className={styles.link} aria-label="Go to home">
      <Image
        className={styles.image}
        src={brandMark}
        alt=""
        sizes="44px"
        priority
      />
    </Link>
  );
};

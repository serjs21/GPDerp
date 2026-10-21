// Server-safe (no "use client", no inline styles).
import { useTranslations } from "next-intl";
import { LANTERN_ASSET_SRC, LANTERN_IMAGE_HEIGHT, LANTERN_IMAGE_WIDTH } from "@/components/Lantern/constants";
import { WagTailLanternFace } from "./WagTailLanternFace";
import type { WagTailLanternLoaderProps } from "./WagTailLanternLoader.types";
import styles from "./WagTailLanternLoader.module.css";

/** WagTailStaticLoader on the lantern base, with a "Loading" caption under the dog on the lantern's front panel. */
export function WagTailLanternLoader({ className }: WagTailLanternLoaderProps) {
  const t = useTranslations("Loaders.wagTailLoader");

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} role="status" aria-label={t("ariaLabel")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- same lantern asset as Lantern, no Next image pipeline */}
      <img
        className={styles.lantern}
        src={LANTERN_ASSET_SRC}
        alt=""
        width={LANTERN_IMAGE_WIDTH}
        height={LANTERN_IMAGE_HEIGHT}
        draggable={false}
      />
      <WagTailLanternFace className={styles.face} />
    </div>
  );
}

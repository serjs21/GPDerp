"use client";

import { useTranslations } from "next-intl";
import {
  ComicPageCtaAction,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { useBuyGenerations } from "./useBuyGenerations";
import styles from "./BuyGenerations.module.css";

export function BuyGenerations() {
  const t = useTranslations("BuyGenerations");
  const { credits, loadingCredits, startingCheckout, initializing, checkoutReady, buy } =
    useBuyGenerations();

  return (
    <div id="buy-generations" className={styles.root}>
      <ComicPageRow className={styles.row}>
        <ComicPagePanel
          background="sunburst"
          color="orange"
          title={t("title")}
          contentAlign="start"
          className={styles.balancePanel}
          flexWeight={1.2}
          sunburstHalftone={false}
        >
          <div className={styles.panelBody}>
            <p className={styles.balance}>
              {loadingCredits || credits === null
                ? t("balanceUnknown")
                : t("balance", { count: credits })}
            </p>
            <p className={styles.product}>{t("product")}</p>
            {!checkoutReady && !initializing ? (
              <p className={styles.muted}>{t("unavailable")}</p>
            ) : null}
          </div>
        </ComicPagePanel>
        <ComicPagePanel
          background="halftone"
          color="yellow"
          title="Buy"
          contentAlign="center"
          className={styles.buyPanel}
          flexWeight={0.9}
        >
          <div className={styles.buyBody}>
            <ComicPageCtaAction
              label={t("buy")}
              busy={startingCheckout || initializing}
              disabled={!checkoutReady || startingCheckout || initializing}
              onClick={() => void buy()}
            />
          </div>
        </ComicPagePanel>
      </ComicPageRow>
    </div>
  );
}

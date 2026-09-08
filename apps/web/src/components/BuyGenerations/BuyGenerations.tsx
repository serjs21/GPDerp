"use client";

import { UIButton, UICard, UIText } from "@/components/ui";
import { useTranslations } from "next-intl";
import { useBuyGenerations } from "./useBuyGenerations";
import styles from "./BuyGenerations.module.css";

export function BuyGenerations() {
  const t = useTranslations("BuyGenerations");
  const { credits, loadingCredits, startingCheckout, checkoutReady, buy } = useBuyGenerations();

  return (
    <UICard title={t("title")}>
      <div id="buy-generations" className={styles.body}>
        <UIText>
          {loadingCredits || credits === null ? t("balanceUnknown") : t("balance", { count: credits })}
        </UIText>
        <UIText muted>{t("product")}</UIText>
        {!checkoutReady ? <UIText muted>{t("unavailable")}</UIText> : null}
        <UIButton
          variant="primary"
          type="button"
          loading={startingCheckout}
          disabled={!checkoutReady || startingCheckout}
          onClick={() => void buy()}
        >
          {t("buy")}
        </UIButton>
      </div>
    </UICard>
  );
}

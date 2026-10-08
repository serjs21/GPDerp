"use client";

import { useTranslations } from "next-intl";
import { ManageLabelsPanel } from "@/components/ManageLabel";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useManageLabelsAccount } from "@/hooks/useAccountLabels";
import styles from "./styles.module.css";

export default function ManageLabelsPage() {
  const t = useTranslations("ManageLabelsPage");
  const { data: accountId, isPending: isAccountPending } = useManageLabelsAccount();

  return (
    <div className={styles.page}>
      <section className={styles.container}>
        {isAccountPending ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : accountId ? (
          <ManageLabelsPanel
            accountId={accountId}
            searchVariant="plain"
            className={styles.panel}
          />
        ) : (
          <p className={styles.empty}>{t("unresolvedAccount")}</p>
        )}
      </section>
    </div>
  );
}

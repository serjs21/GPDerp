"use client";

import { useTranslations } from "next-intl";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPageCtaAction, ComicPagePanel } from "@/components/ComicPageLayout";
import { IconUploader } from "@/components/IconUploader";
import { useBuyGenerations } from "@/components/BuyGenerations";
import { useProfile } from "@/app/settings/ProfileContext";
import { useGenerationCredits } from "@/hooks/useGenerationCredits";
import { useProfileI18n } from "@/hooks/useProfileI18n";
import styles from "./LibraryCard.module.css";

const PHOTO_SIZE_PX = 128;

function readNameFields(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    firstName: String(data.get("firstName") ?? ""),
    lastName: String(data.get("lastName") ?? ""),
  };
}

export function LibraryCard() {
  const profile = useProfile();
  const { profileInfo } = useProfileI18n();
  const t = useTranslations("LibraryCard");
  const { credits, loadingCredits } = useGenerationCredits();
  const { startingCheckout, initializing, checkoutReady, buy } = useBuyGenerations();

  const remainingLabel =
    loadingCredits || credits === null ? t("remainingUnknown") : t("remaining", { count: credits });
  const buyDisabled = !checkoutReady || startingCheckout || initializing;

  const saveNamesIfChanged = (form: HTMLFormElement) => {
    if (profile.saving) return;
    const { firstName, lastName } = readNameFields(form);
    if (firstName === profile.firstName && lastName === profile.lastName) return;
    void profile.onSaveProfile({ firstName, lastName });
  };

  return (
    <div id="buy-generations" className={styles.root}>
      <ComicPagePanel
        contentAlign="start"
        className={styles.panel}
        span="full"
      >
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.photo}>
              <IconUploader
                className={styles.uploader}
                size={PHOTO_SIZE_PX}
                iconUrl={profile.avatarUrl}
                alt={t("profileIconAlt", { name: profile.displayName })}
                fallbackChar={profile.displayName.slice(0, 1)}
                disabled={profile.savingAvatar}
                onUploaded={profile.onAvatarUploaded}
              />
            </div>
            <div className={styles.details}>
              <p className={styles.belongsTo}>{t("belongsTo")}</p>
              <form
                key={profile.email}
                className={styles.nameForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  saveNamesIfChanged(e.currentTarget);
                }}
                onBlur={(e) => {
                  const next = e.relatedTarget;
                  if (next instanceof Node && e.currentTarget.contains(next)) return;
                  saveNamesIfChanged(e.currentTarget);
                }}
              >
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{profileInfo("firstName")}</span>
                  <ComicModalInput
                    name="firstName"
                    defaultValue={profile.firstName}
                    aria-label={profileInfo("firstName")}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{profileInfo("lastName")}</span>
                  <ComicModalInput
                    name="lastName"
                    defaultValue={profile.lastName}
                    aria-label={profileInfo("lastName")}
                  />
                </label>
              </form>
              <div className={styles.generations}>
                <p className={styles.remaining} aria-live="polite">
                  {remainingLabel}
                </p>
                <ComicPageCtaAction
                  label={t("buyMore")}
                  busy={startingCheckout || initializing}
                  disabled={buyDisabled}
                  onClick={() => void buy()}
                />
              </div>
            </div>
          </div>
          <div className={styles.barcode} aria-hidden />
        </div>
      </ComicPagePanel>
    </div>
  );
}

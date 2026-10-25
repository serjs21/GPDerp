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
    nickname: String(data.get("nickname") ?? "").trim(),
  };
}

export function LibraryCard() {
  const profile = useProfile();
  const { profileInfo } = useProfileI18n();
  const t = useTranslations("LibraryCard");
  const { credits, loadingCredits } = useGenerationCredits();
  const { startingCheckout, checkoutReady, prepareCheckout, buy } = useBuyGenerations();

  const remainingLabel =
    loadingCredits || credits === null ? t("remainingUnknown") : t("remaining", { count: credits });
  const buyDisabled = !checkoutReady || startingCheckout;

  const saveNamesIfChanged = (form: HTMLFormElement) => {
    if (profile.saving) return;
    const { firstName, lastName, nickname } = readNameFields(form);
    const nicknameChanged = nickname !== profile.nickname;
    if (firstName === profile.firstName && lastName === profile.lastName && !nicknameChanged) return;
    void profile.onSaveProfile({ firstName, lastName, nickname: nicknameChanged ? nickname : undefined });
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
                // Remount on save so inputs show the stored values (the nickname is normalized server-side).
                key={`${profile.email}|${profile.nickname}|${profile.firstName}|${profile.lastName}`}
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
                <div className={styles.nameRow}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{profileInfo("firstName")}</span>
                    <ComicModalInput
                      name="firstName"
                      defaultValue={profile.firstName}
                      aria-label={profileInfo("firstName")}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{profileInfo("nickname")}</span>
                    <ComicModalInput
                      name="nickname"
                      defaultValue={profile.nickname}
                      aria-label={profileInfo("nickname")}
                      autoComplete="nickname"
                      maxLength={32}
                    />
                  </label>
                </div>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{profileInfo("lastName")}</span>
                  <ComicModalInput
                    name="lastName"
                    defaultValue={profile.lastName}
                    aria-label={profileInfo("lastName")}
                  />
                </label>
              </form>
              <div
                className={styles.generations}
                onPointerEnter={prepareCheckout}
                onFocus={prepareCheckout}
              >
                <p className={styles.remaining} aria-live="polite">
                  {remainingLabel}
                </p>
                <ComicPageCtaAction
                  label={t("buyMore")}
                  busy={startingCheckout}
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

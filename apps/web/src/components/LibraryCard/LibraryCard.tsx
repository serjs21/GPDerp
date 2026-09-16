"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPageCtaAction, ComicPagePanel } from "@/components/ComicPageLayout";
import { IconUploader } from "@/components/IconUploader";
import { useBuyGenerations } from "@/components/BuyGenerations";
import { useProfile } from "@/app/settings/ProfileContext";
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

function sampleColor(el: Element | null) {
  if (!(el instanceof HTMLElement)) return null;
  const cs = getComputedStyle(el);
  return {
    color: cs.color,
    backgroundColor: cs.backgroundColor,
    fontFamily: cs.fontFamily.slice(0, 80),
    fontSize: cs.fontSize,
  };
}

export function LibraryCard() {
  const profile = useProfile();
  const { profileInfo } = useProfileI18n();
  const t = useTranslations("LibraryCard");
  const rootRef = useRef<HTMLDivElement>(null);
  const { credits, loadingCredits, startingCheckout, initializing, checkoutReady, buy } =
    useBuyGenerations();

  const remainingLabel =
    loadingCredits || credits === null ? t("remainingUnknown") : t("remaining", { count: credits });
  const buyDisabled = !checkoutReady || startingCheckout || initializing;

  const saveNamesIfChanged = (form: HTMLFormElement) => {
    if (profile.saving) return;
    const { firstName, lastName } = readNameFields(form);
    if (firstName === profile.firstName && lastName === profile.lastName) return;
    void profile.onSaveProfile({ firstName, lastName });
  };

  // #region agent log
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const theme = document.documentElement.getAttribute("data-theme");
    const rootCs = getComputedStyle(document.documentElement);
    const card = root.querySelector(`.${styles.card}`);
    const belongsTo = root.querySelector(`.${styles.belongsTo}`);
    const fieldLabel = root.querySelector(`.${styles.fieldLabel}`);
    const remaining = root.querySelector(`.${styles.remaining}`);
    const input = root.querySelector("input");
    const buyBtn = root.querySelector("button");
    const cardSumi =
      card instanceof HTMLElement
        ? getComputedStyle(card).getPropertyValue("--sumi-ink").trim()
        : null;
    const labelsSlot = document.querySelector("[class*='slotLabels']");
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8e01e4" },
      body: JSON.stringify({
        sessionId: "8e01e4",
        runId: "css-post-fix",
        hypothesisId: "A",
        location: "LibraryCard.tsx:computed-styles",
        message: "LibraryCard computed colors",
        data: {
          theme,
          rootSumiInk: rootCs.getPropertyValue("--sumi-ink").trim(),
          cardSumiInk: cardSumi,
          textColor: rootCs.getPropertyValue("--text-color").trim(),
          card: sampleColor(card),
          belongsTo: sampleColor(belongsTo),
          fieldLabel: sampleColor(fieldLabel),
          remaining: sampleColor(remaining),
          input: sampleColor(input),
          inputClass: input instanceof HTMLElement ? input.className : null,
          buyBtn: sampleColor(buyBtn),
          labelsSlotBg:
            labelsSlot instanceof HTMLElement
              ? getComputedStyle(labelsSlot).backgroundColor
              : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [credits, loadingCredits]);
  // #endregion

  return (
    <div id="buy-generations" ref={rootRef} className={styles.root}>
      <ComicPagePanel
        contentAlign="start"
        className={styles.panel}
        span="full"
        sunburstHalftone={false}
      >
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.photo}>
              <IconUploader
                className={styles.uploader}
                size={PHOTO_SIZE_PX}
                iconUrl={profile.avatarUrl}
                alt={`${profile.displayName} profile icon`}
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

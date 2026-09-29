"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { comicToast } from "@/components/ComicToast";
import {
  ComicPageLayout,
} from "@/components/ComicPageLayout";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { AuthProvider } from "@/types";
import { isValidEmail } from "@/utils/strings";
import {
  fetchOwnProfile,
  requestEmailChange,
  resendEmailChange,
  updateOwnAvatar,
  updateOwnProfile,
  type UserProfileResponse,
} from "@/api/user";
import {
  isAppLocale,
  isThemeName,
  PREFERENCE_LOCALE_STORAGE_KEY,
  PREFERENCE_THEME_STORAGE_KEY,
} from "@/config/userConfiguration";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useTranslations } from "next-intl";
import {
  LabelMethodIcon,
  type LabelMethodIconProps,
} from "@/components/LabelMethodIcon";
import { ManageLabelsPanel } from "@/components/ManageLabel";
import { ShareLinkManagement } from "@/components/ShareLinkManagement";
import {
  ComicPanelTabs,
  type ComicPagePanelOptions,
} from "@/components/ComicPanelTabs";
import { useManageLabelsAccount } from "@/hooks/useAccountLabels";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SETTINGS_SIDE_PANEL_QUERY } from "@/consts/settings/settingsLayoutConsts";
import { ProfileProvider, type ProfileContextValue } from "./ProfileContext";
import { ProfileInfoTab } from "./components/ProfileInfoTab";
import { shouldApplyServerPreference } from "./tabState";
import styles from "./profilePage.module.css";

export type ProfilePageTab = "profile" | "share-links" | "labels";

const PROFILE_TABS: ProfilePageTab[] = ["profile", "share-links", "labels"];

function parseProfileTab(value: string | null): ProfilePageTab {
  if (value && PROFILE_TABS.includes(value as ProfilePageTab)) {
    return value as ProfilePageTab;
  }
  return "profile";
}

const TAB_META: Record<
  ProfilePageTab,
  {
    title: string;
    background: NonNullable<ComicPagePanelOptions["background"]>;
    color: NonNullable<ComicPagePanelOptions["color"]>;
    ariaLabel: string;
    iconSrc: string;
    bubbleStyle: NonNullable<LabelMethodIconProps["bubbleStyle"]>;
  }
> = {
  profile: {
    title: "Profile",
    background: "sunburst",
    color: "#ff4545",
    ariaLabel: "Profile information",
    iconSrc: "/profile/profile.svg",
    bubbleStyle: "square",
  },
  "share-links": {
    title: "Share Links",
    background: "solid",
    color: "#9d8ccd",
    ariaLabel: "Manage share links",
    iconSrc: "/profile/share_link.svg",
    bubbleStyle: "thought",
  },
  labels: {
    title: "Labels",
    background: "halftone",
    color: "#4ce8d9",
    ariaLabel: "Manage labels",
    iconSrc: "/profile/labels.svg",
    bubbleStyle: "diamond",
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { initialized, isLoggedIn, checkAuthentication } = useAuthenticationState();
  const { openAuthenticationModal } = useAuthenticationVerification();
  const hasStoredTheme = useRef(false);
  const hasStoredLanguage = useRef(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);
  const [resendEmailDraft, setResendEmailDraft] = useState("");
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [resendingEmailChange, setResendingEmailChange] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [sideNode, setSideNode] = useState<HTMLElement | null>(null);
  const sidePanelWide = useMediaQuery(SETTINGS_SIDE_PANEL_QUERY);
  const { setTheme } = useTheme();
  const { setLocale } = useLocale();
  const { data: labelsAccountId } = useManageLabelsAccount();
  const t = useTranslations("Profile");

  const tab = parseProfileTab(tabParam);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#buy-generations" && tab !== "profile") {
      router.replace("/settings?tab=profile#buy-generations", { scroll: false });
    }
  }, [router, tab]);

  useEffect(() => {
    if (tabParam === "settings") {
      router.replace("/settings?tab=profile", { scroll: false });
      return;
    }
    if (tabParam === "tokens") {
      router.replace("/settings?tab=profile#buy-generations", { scroll: false });
      return;
    }
    if (tabParam != null && tabParam !== tab) {
      router.replace("/settings?tab=profile", { scroll: false });
    }
  }, [tabParam, tab, router]);

  const setTab = (next: ProfilePageTab) => {
    if (next === tab) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    // Search is tab-scoped (share-links vs labels); clear on every switch.
    params.delete("search");
    if (next !== "share-links") {
      params.delete("filter");
      params.delete("sort");
      params.delete("dir");
    }
    router.replace(`/settings?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = window.localStorage.getItem(PREFERENCE_THEME_STORAGE_KEY);
    if (storedTheme && isThemeName(storedTheme)) {
      hasStoredTheme.current = true;
      setTheme(storedTheme);
    }
    const storedLanguage = window.localStorage.getItem(PREFERENCE_LOCALE_STORAGE_KEY);
    if (storedLanguage && isAppLocale(storedLanguage)) {
      hasStoredLanguage.current = true;
      setLocale(storedLanguage);
    }
  }, [setLocale, setTheme]);

  useEffect(() => {
    if (!initialized) return;
    if (!isLoggedIn) openAuthenticationModal("login");
  }, [initialized, isLoggedIn, openAuthenticationModal]);

  const validEmailDraft = useMemo(() => isValidEmail(emailDraft), [emailDraft]);

  useEffect(() => {
    if (!initialized || !isLoggedIn) return;
    setLoading(true);
    void fetchOwnProfile()
      .then((data) => {
        setProfile(data);
        if (
          shouldApplyServerPreference({
            hasClientPreference: hasStoredTheme.current,
            isValidServerValue: isThemeName(data.configuration.theme),
          })
        ) {
          setTheme(data.configuration.theme);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(PREFERENCE_THEME_STORAGE_KEY, data.configuration.theme);
          }
        }
        if (
          shouldApplyServerPreference({
            hasClientPreference: hasStoredLanguage.current,
            isValidServerValue: isAppLocale(data.configuration.language),
          })
        ) {
          setLocale(data.configuration.language);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(PREFERENCE_LOCALE_STORAGE_KEY, data.configuration.language);
          }
        }
      })
      .catch(() => {
        comicToast.error("Could not load profile");
      })
      .finally(() => setLoading(false));
  }, [initialized, isLoggedIn, setLocale, setTheme]);

  if (!initialized || !isLoggedIn) return null;
  if (loading || !profile) return null;

  const displayName = profile.userName || profile.email || "User";
  const isGoogleUser = profile.providers.includes(AuthProvider.GOOGLE);
  const pendingNewEmail = profile.pendingEmailChange?.newEmail ?? null;

  const onSaveProfile = async (values: { firstName?: string; lastName?: string }) => {
    try {
      setSaving(true);
      const updated = await updateOwnProfile({
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setProfile(updated);
      comicToast.success("Profile updated");
      checkAuthentication();
    } catch {
      comicToast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const createEmailChange = async () => {
    try {
      setRequestingEmailChange(true);
      const result = await requestEmailChange(emailDraft.trim());
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              pendingEmailChange: {
                newEmail: result.pendingEmail,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                requestedAt: new Date().toISOString(),
              },
            }
          : prev,
      );
      setEmailConfirmOpen(false);
      comicToast.success("Email change verification sent");
    } catch {
      comicToast.error("Could not create email change request");
    } finally {
      setRequestingEmailChange(false);
    }
  };

  const resendChange = async () => {
    try {
      setResendingEmailChange(true);
      const result = await resendEmailChange(resendEmailDraft.trim() || undefined);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              pendingEmailChange: {
                newEmail: result.pendingEmail,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                requestedAt: new Date().toISOString(),
              },
            }
          : prev,
      );
      setResendOpen(false);
      comicToast.success("Verification email sent");
    } catch {
      comicToast.error("Could not resend verification email");
    } finally {
      setResendingEmailChange(false);
    }
  };

  const profileContextValue: ProfileContextValue = {
    displayName,
    avatarUrl: profile.avatar,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    isGoogleUser,
    pendingEmailChange: pendingNewEmail ? { newEmail: pendingNewEmail } : null,
    emailDraft,
    resendEmailDraft,
    validEmailDraft,
    saving,
    savingAvatar,
    requestingEmailChange,
    resendingEmailChange,
    emailConfirmOpen,
    resendOpen,
    saveProfileLabel: t("saveProfile"),
    onSaveProfile,
    onAvatarUploaded: ({ publicUrl }) => {
      void (async () => {
        try {
          setSavingAvatar(true);
          const updated = await updateOwnAvatar(publicUrl);
          setProfile(updated);
          comicToast.success("Profile picture saved");
          checkAuthentication();
        } catch {
          comicToast.error("Could not save profile picture to your account");
        } finally {
          setSavingAvatar(false);
        }
      })();
    },
    onEmailDraftChange: setEmailDraft,
    onResendEmailDraftChange: setResendEmailDraft,
    onOpenEmailConfirm: () => setEmailConfirmOpen(true),
    onCloseEmailConfirm: () => setEmailConfirmOpen(false),
    onConfirmEmailChange: () => void createEmailChange(),
    onOpenResend: () => {
      setResendEmailDraft(pendingNewEmail ?? "");
      setResendOpen(true);
    },
    onCloseResend: () => setResendOpen(false),
    onConfirmResend: () => void resendChange(),
  };

  const showSidePanel = sidePanelWide && tab === "labels";
  const sidePanelTarget = showSidePanel ? sideNode : null;

  return (
    <main className={styles.page}>
      <ProfileProvider value={profileContextValue}>
        <ComicPageLayout className={styles.layout}>
          <div className={styles.body}>
            <ComicPanelTabs
              className={styles.tabRow}
              panelClassName={styles.tabPanel}
              value={tab}
              onChange={setTab}
              tabs={PROFILE_TABS.map((id) => {
                const meta = TAB_META[id];
                return {
                  id,
                  panel: {
                    title: meta.title,
                    background: meta.background,
                    color: meta.color,
                    ariaLabel: meta.ariaLabel,
                  },
                  content: (
                    <LabelMethodIcon
                      src={meta.iconSrc}
                      bubbleStyle={meta.bubbleStyle}
                      sourceDirection="none"
                      active={tab === id}
                    />
                  ),
                };
              })}
            />

            <div
              className={[
                styles.contentSlot,
                showSidePanel ? styles.contentSlotWithSide : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab === "profile" ? <ProfileInfoTab /> : null}
              {tab === "share-links" ? <ShareLinkManagement active /> : null}
              {tab === "labels" && labelsAccountId ? (
                <ManageLabelsPanel
                  accountId={labelsAccountId}
                  active
                  searchVariant="none"
                  searchQuery={searchParams.get("search") ?? ""}
                  showCreate
                  showSort
                  sidePanelTarget={sidePanelTarget}
                />
              ) : null}
              {showSidePanel ? (
                <aside
                  ref={setSideNode}
                  className={styles.sidePanel}
                  aria-label="Sort and filter"
                />
              ) : null}
            </div>
          </div>
        </ComicPageLayout>
      </ProfileProvider>
    </main>
  );
}

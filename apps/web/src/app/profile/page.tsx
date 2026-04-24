"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { message } from "@/components/StyledComponents";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
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
import { ProfileProvider, type ProfileContextValue } from "./ProfileContext";
import { ProfileInfoTab } from "./components/ProfileInfoTab";
import { UICard } from "@/components/ui";
import { shouldApplyServerPreference } from "./tabState";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { initialized, isLoggedIn, checkAuthentication } = useAuthenticationState();
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
  const { setTheme } = useTheme();
  const { setLocale } = useLocale();
  const t = useTranslations("Profile");

  useEffect(() => {
    if (tabParam !== "settings") return;
    router.replace("/profile", { scroll: false });
  }, [tabParam, router]);

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
    if (!isLoggedIn) router.replace("/");
  }, [initialized, isLoggedIn, router]);

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
        message.error("Could not load profile");
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
      message.success("Profile updated");
      checkAuthentication();
    } catch {
      message.error("Could not update profile");
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
      message.success("Email change verification sent");
    } catch {
      message.error("Could not create email change request");
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
      message.success("Verification email sent");
    } catch {
      message.error("Could not resend verification email");
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
          message.success("Profile picture saved");
          checkAuthentication();
        } catch {
          message.error("Could not save profile picture to your account");
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

  return (
    <main
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        maxWidth: 720,
        margin: "24px auto",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <ProfileProvider value={profileContextValue}>
        <UICard title={t("title")}>
          <ProfileInfoTab />
        </UICard>
      </ProfileProvider>
    </main>
  );
}

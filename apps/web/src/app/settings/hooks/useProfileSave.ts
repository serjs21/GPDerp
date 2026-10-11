"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { updateOwnAvatar, updateOwnProfile, type UserProfileResponse } from "@/api/user";
import { comicToast } from "@/components/ComicToast";
import type { ProfileContextValue } from "../ProfileContext";

/** Name and avatar saves; both refresh the auth session so the header picks up changes. */
export function useProfileSave(
  setProfile: Dispatch<SetStateAction<UserProfileResponse | null>>,
  checkAuthentication: () => void,
) {
  const t = useTranslations("Profile");
  const [saving, setSaving] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const onSaveProfile: ProfileContextValue["onSaveProfile"] = async (values) => {
    try {
      setSaving(true);
      const updated = await updateOwnProfile({
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setProfile(updated);
      comicToast.success(t("toasts.updateSuccess"));
      checkAuthentication();
    } catch {
      comicToast.error(t("toasts.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const onAvatarUploaded: ProfileContextValue["onAvatarUploaded"] = ({ publicUrl }) => {
    void (async () => {
      try {
        setSavingAvatar(true);
        const updated = await updateOwnAvatar(publicUrl);
        setProfile(updated);
        comicToast.success(t("toasts.avatarSaved"));
        checkAuthentication();
      } catch {
        comicToast.error(t("toasts.avatarError"));
      } finally {
        setSavingAvatar(false);
      }
    })();
  };

  return { saving, savingAvatar, onSaveProfile, onAvatarUploaded };
}

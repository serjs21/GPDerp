"use client";

import axios from "axios";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { updateOwnAvatar, updateOwnProfile, type UserProfileResponse } from "@/api/user";
import { refreshAuthSession } from "@/authRefresh";
import { comicToast } from "@/components/ComicToast";
import type { ProfileContextValue } from "../ProfileContext";

/** Username rules the API applies to the nickname (see the API's usernameValidation). */
const NICKNAME_LIMITS = { min: 3, max: 32 };

function profileSaveErrorKey(error: unknown) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status === 409) return "toasts.nicknameTaken";
  if (status === 400) return "toasts.nicknameInvalid";
  return "toasts.updateError";
}

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
        userName: values.nickname,
      });
      setProfile(updated);
      comicToast.success(t("toasts.updateSuccess"));
      // The access token carries the username claim the header reads first; re-issue it.
      if (values.nickname !== undefined) await refreshAuthSession({ force: true }).catch(() => undefined);
      checkAuthentication();
    } catch (error) {
      comicToast.error(t(profileSaveErrorKey(error), NICKNAME_LIMITS));
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

"use client";

import type { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import type { UserProfileResponse } from "@/api/user";
import type { ProfileContextValue } from "../ProfileContext";
import { profileIdentity } from "../utils/profileUtils";
import { useProfileSave } from "./useProfileSave";

/** Profile tab context (identity + save flows); null until the profile has loaded. */
export function useProfileContextValue(
  profile: UserProfileResponse | null,
  setProfile: Dispatch<SetStateAction<UserProfileResponse | null>>,
  checkAuthentication: () => void,
): ProfileContextValue | null {
  const t = useTranslations("Profile");
  const save = useProfileSave(setProfile, checkAuthentication);
  if (!profile) return null;

  return {
    ...profileIdentity(profile, t("userFallback")),
    ...save,
    saveProfileLabel: t("saveProfile"),
  };
}

"use client";

import type { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import type { UserProfileResponse } from "@/api/user";
import type { ProfileContextValue } from "../ProfileContext";
import { pendingNewEmailOf, profileIdentity } from "../utils/profileUtils";
import { useProfileEmailChange } from "./useProfileEmailChange";
import { useProfileSave } from "./useProfileSave";

/** Profile tab context (identity + save/email flows); null until the profile has loaded. */
export function useProfileContextValue(
  profile: UserProfileResponse | null,
  setProfile: Dispatch<SetStateAction<UserProfileResponse | null>>,
  checkAuthentication: () => void,
): ProfileContextValue | null {
  const t = useTranslations("Profile");
  const save = useProfileSave(setProfile, checkAuthentication);
  const emailChange = useProfileEmailChange(setProfile, pendingNewEmailOf(profile));
  if (!profile) return null;

  return {
    ...profileIdentity(profile, t("userFallback")),
    ...save,
    ...emailChange,
    saveProfileLabel: t("saveProfile"),
  };
}

"use client";

import { createContext, useContext } from "react";

type ProfileInfoFormValues = {
  firstName?: string;
  lastName?: string;
};

export type ProfileContextValue = {
  displayName: string;
  avatarUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  isGoogleUser: boolean;
  pendingEmailChange: { newEmail: string } | null;
  emailDraft: string;
  resendEmailDraft: string;
  validEmailDraft: boolean;
  saving: boolean;
  savingAvatar: boolean;
  requestingEmailChange: boolean;
  resendingEmailChange: boolean;
  emailConfirmOpen: boolean;
  resendOpen: boolean;
  saveProfileLabel: string;
  onSaveProfile: (values: ProfileInfoFormValues) => Promise<void>;
  onAvatarUploaded: (payload: { publicUrl: string }) => void;
  onEmailDraftChange: (value: string) => void;
  onResendEmailDraftChange: (value: string) => void;
  onOpenEmailConfirm: () => void;
  onCloseEmailConfirm: () => void;
  onConfirmEmailChange: () => void;
  onOpenResend: () => void;
  onCloseResend: () => void;
  onConfirmResend: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const ProfileProvider = ({
  value,
  children,
}: {
  value: ProfileContextValue;
  children: React.ReactNode;
}) => <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;

export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};

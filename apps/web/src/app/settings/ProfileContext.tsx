"use client";

import { createContext, useContext } from "react";

type ProfileInfoFormValues = {
  firstName?: string;
  lastName?: string;
  /** Saved as the account's unique username. */
  nickname?: string;
};

export type ProfileContextValue = {
  displayName: string;
  avatarUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  saving: boolean;
  savingAvatar: boolean;
  saveProfileLabel: string;
  onSaveProfile: (values: ProfileInfoFormValues) => Promise<void>;
  onAvatarUploaded: (payload: { publicUrl: string }) => void;
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

import type { ProfileTabContentProps } from "@/app/settings/components/ProfileTabContent.types";

export type SettingsStoryPageProps = Pick<ProfileTabContentProps, "tab"> & {
  /** Settings header search (`?search=`); filters the labels tab. */
  searchQuery?: ProfileTabContentProps["searchQuery"];
};

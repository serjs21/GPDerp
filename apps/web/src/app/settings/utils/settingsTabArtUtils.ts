import { labelSortCoverSrcs } from "@/components/LabelSort/utils/labelSortLocaleUtils";
import { TICKET_BASE_SRC } from "@/components/ManageLabel/consts/ticketRotationConsts";
import { SHARE_LINK_FILTER_OPTIONS } from "@/components/ShareLinkManagement/consts/shareLinkFilterConsts";
import { shareLinksSortCoverSrcs } from "@/components/ShareLinksSort/utils/shareLinksSortLocaleUtils";
import type { AppLocale } from "@/config/userConfiguration";
import type { ProfilePageTab } from "../components/ProfileTabs.types";
import { PROFILE_TABS, TAB_META } from "../consts/profileTabsConsts";

/**
 * Control art in the first frame of a settings tab: the tab strip plus the active tab's sort coins,
 * filters, and create panel. Other tabs' art is deferred until they open.
 */
export function settingsTabArtSrcs(tab: ProfilePageTab, locale: AppLocale): string[] {
  const tabIcons = PROFILE_TABS.map((id) => TAB_META[id].iconSrc);
  if (tab === "share-links") {
    return [
      ...tabIcons,
      ...shareLinksSortCoverSrcs(locale),
      ...SHARE_LINK_FILTER_OPTIONS.map((option) => option.iconSrc),
    ];
  }
  if (tab === "labels") return [...tabIcons, ...labelSortCoverSrcs(locale), TICKET_BASE_SRC];
  return tabIcons;
}

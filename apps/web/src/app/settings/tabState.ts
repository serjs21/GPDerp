import type { ProfilePageTab } from "./components/ProfileTabs.types";
import { PROFILE_TABS } from "./consts/profileTabsConsts";

export const shouldApplyServerPreference = (params: {
  hasClientPreference: boolean;
  isValidServerValue: boolean;
}): boolean => !params.hasClientPreference && params.isValidServerValue;

export function parseProfileTab(value: string | null): ProfilePageTab {
  if (value && PROFILE_TABS.includes(value as ProfilePageTab)) {
    return value as ProfilePageTab;
  }
  return "profile";
}

/** Legacy (`settings`, `tokens`) and unknown `?tab=` values redirect to the profile tab; null when the URL is fine. */
export function profileTabRedirect(tabParam: string | null, tab: ProfilePageTab): string | null {
  if (tabParam === "settings") return "/settings?tab=profile";
  if (tabParam === "tokens") return "/settings?tab=profile#buy-generations";
  if (tabParam != null && tabParam !== tab) return "/settings?tab=profile";
  return null;
}

/** Query for switching tabs: search is tab-scoped (always cleared); list filters belong to share-links only. */
export function profileTabSwitchQuery(currentQuery: string, next: ProfilePageTab): string {
  const params = new URLSearchParams(currentQuery);
  params.set("tab", next);
  params.delete("search");
  if (next !== "share-links") {
    params.delete("filter");
    params.delete("sort");
    params.delete("dir");
  }
  return params.toString();
}

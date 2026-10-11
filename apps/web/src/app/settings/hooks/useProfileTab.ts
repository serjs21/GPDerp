"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProfilePageTab } from "../components/ProfileTabs.types";
import { parseProfileTab, profileTabRedirect, profileTabSwitchQuery } from "../tabState";

/** Active settings tab from `?tab=`, legacy/unknown tab redirects, and tab switching via the URL. */
export function useProfileTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab = parseProfileTab(tabParam);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#buy-generations" && tab !== "profile") {
      router.replace("/settings?tab=profile#buy-generations", { scroll: false });
    }
  }, [router, tab]);

  useEffect(() => {
    const target = profileTabRedirect(tabParam, tab);
    if (target) router.replace(target, { scroll: false });
  }, [tabParam, tab, router]);

  const setTab = (next: ProfilePageTab) => {
    if (next === tab) return;
    router.replace(`/settings?${profileTabSwitchQuery(searchParams.toString(), next)}`, { scroll: false });
  };

  return { tab, setTab, searchQuery: searchParams.get("search") ?? "" };
}

import * as shareLinksApi from "@/api/shareLinks";
import type { ShareLinkListItem } from "@/api/shareLinks";

/** Injected create/refresh API functions, defaulting to the real share-link API. */
export function shareLinkApiFns(fns: {
  createShareLinkFn?: typeof shareLinksApi.createShareLink;
  refreshShareLinkFn?: typeof shareLinksApi.refreshShareLink;
}) {
  return {
    createShareLinkFn: fns.createShareLinkFn ?? shareLinksApi.createShareLink,
    refreshShareLinkFn: fns.refreshShareLinkFn ?? shareLinksApi.refreshShareLink,
  };
}

export function shareLinkCardClassName(styles: Record<string, string>, grayscale: boolean) {
  return [styles.root, styles.card, grayscale && styles.cardInactive].filter(Boolean).join(" ");
}

/** Fields the share-link card reads from a possibly-missing link (not created yet). */
export function shareLinkCardView(link: ShareLinkListItem | null, haikuId: string) {
  return {
    showLabels: link?.showLabels ?? false,
    lanternFallbackId: haikuId || link?.sharedHaikuId || link?.id || "share-link-preview",
    createdAt: link?.createdAt ?? null,
    shareUrl: link?.shareUrl,
  };
}

export type ShareLinkLifecyclePhase = "activating" | "stopping" | "stop" | "start";

/** In-flight start/stop first, then Stop for a running link, otherwise Launch / Restart. */
export function shareLinkLifecyclePhase(params: {
  activating: boolean;
  deactivating: boolean;
  active: boolean;
}): ShareLinkLifecyclePhase {
  if (params.activating) return "activating";
  if (params.deactivating) return "stopping";
  return params.active ? "stop" : "start";
}

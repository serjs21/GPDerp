/** Share (link editor, email pane) and label modals: loaded on intent, mounted on first open. */
export const loadShareModal = () =>
  import("@/components/ShareModal/ShareModal").then((mod) => mod.ShareModal);

export const loadCreateAddLabelsModal = () =>
  import("@/components/CreateAddLabelsModal/CreateAddLabelsModal").then((mod) => mod.CreateAddLabelsModal);

/** Warms the modal chunks when an action button is hovered/focused, so the click opens without a wait. */
export function preloadHaikuActionModals() {
  void loadShareModal();
  void loadCreateAddLabelsModal();
}

/**
 * Newly confirmed haiku labels (selection order) await LabelHalo / LabelBelt puffIn.
 * Enqueued on confirm click; taken when those ids are present on the lantern.
 */
let pendingPuffInIds: string[] = [];

export function enqueueLabelBeltPuffIn(ids: readonly string[]) {
  if (ids.length === 0) return;
  const seen = new Set(pendingPuffInIds);
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    pendingPuffInIds.push(id);
  }
}

/** Pull only ids already present; leave the rest queued for a later update. */
export function takeLabelBeltPuffIn(presentIds: ReadonlySet<string>): string[] {
  if (pendingPuffInIds.length === 0) return [];
  const taken: string[] = [];
  const remaining: string[] = [];
  for (const id of pendingPuffInIds) {
    if (presentIds.has(id)) taken.push(id);
    else remaining.push(id);
  }
  pendingPuffInIds = remaining;
  return taken;
}

export function clearLabelBeltPuffIn() {
  pendingPuffInIds = [];
}

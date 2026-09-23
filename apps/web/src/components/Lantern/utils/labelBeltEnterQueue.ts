/**
 * Newly confirmed haiku labels (selection order) await LabelHalo / LabelBelt puffIn.
 * Enqueued on save; consumed when the belt/halo next sees updated labels.
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

export function consumeLabelBeltPuffIn(): string[] {
  if (pendingPuffInIds.length === 0) return [];
  const ids = pendingPuffInIds;
  pendingPuffInIds = [];
  return ids;
}

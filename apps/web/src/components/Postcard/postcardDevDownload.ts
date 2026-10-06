/**
 * Dev-only helpers for inspecting generated postcards. Not exported from the
 * Postcard barrel; production callers should consume the Blob directly.
 */

export function postcardFilename(haikuId: string): string {
  return `postcard-${haikuId}.png`;
}

export function downloadPostcardBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function openPostcardBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener");
  if (!opened) {
    URL.revokeObjectURL(url);
    throw new Error("Popup blocked: allow popups to open the postcard PNG");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

import styles from "../IconUploader.module.css";

export type IconFaceSource =
  | { kind: "preview"; url: string }
  | { kind: "remote"; url: string }
  | { kind: "placeholder" };

/** Local upload preview first, then the saved remote icon unless it already failed to load. */
export function iconFaceSource(params: {
  previewUrl: string | null | undefined;
  iconUrl: string | undefined;
  failedRemoteImageUrl: string | null;
}): IconFaceSource {
  const { previewUrl, iconUrl, failedRemoteImageUrl } = params;
  if (previewUrl) return { kind: "preview", url: previewUrl };
  if (iconUrl && failedRemoteImageUrl !== iconUrl) return { kind: "remote", url: iconUrl };
  return { kind: "placeholder" };
}

export function placeholderInitial(fallbackChar: string | undefined): string {
  return (fallbackChar?.trim().slice(0, 1) || "?").toUpperCase();
}

export function iconHitClassName(params: { disabled: boolean; isUploading: boolean; isDragActive: boolean }): string {
  return [
    styles.iconHitArea,
    params.disabled && styles.iconHitAreaDisabled,
    params.isUploading && styles.iconHitAreaUploading,
    params.isDragActive && styles.dropZoneActive,
  ]
    .filter(Boolean)
    .join(" ");
}

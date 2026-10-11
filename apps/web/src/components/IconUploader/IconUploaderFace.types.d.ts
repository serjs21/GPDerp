export type IconUploaderFaceProps = {
  previewUrl: string | null;
  iconUrl?: string;
  alt?: string;
  fallbackChar?: string;
  size: number;
  isUploading: boolean;
  /** Remote icon URL that failed to load (e.g. Google CDN 429); shows the placeholder instead. */
  failedRemoteImageUrl: string | null;
  onRemoteImageError: (url: string) => void;
};

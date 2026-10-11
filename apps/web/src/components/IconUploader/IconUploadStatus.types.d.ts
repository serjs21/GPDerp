export type IconUploadStatusProps = {
  isUploading: boolean;
  /** Upload progress 0–100. */
  progress: number;
  error: string | null;
  success: string | null;
};

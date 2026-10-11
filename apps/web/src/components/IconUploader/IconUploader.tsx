"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { withDefaults } from "@/utils/props/withDefaults";
import { IconUploaderFace } from "./IconUploaderFace";
import { IconUploadStatus } from "./IconUploadStatus";
import { iconHitClassName } from "./utils/iconUploaderUtils";
import styles from "./IconUploader.module.css";

export type IconUploaderResult = {
  key: string;
  publicUrl: string;
};

const DEFAULT_SIZE_PX = 44;

type IconUploaderProps = {
  label?: string;
  iconUrl?: string;
  alt?: string;
  /** Shown when the URL is missing or the image fails to load (e.g. Google CDN429). */
  fallbackChar?: string;
  disabled?: boolean;
  className?: string;
  /** Intrinsic image size in px. Layout size follows `--icon-uploader-size`. */
  size?: number;
  onUploaded: (result: IconUploaderResult) => void;
};

const ICON_UPLOADER_DEFAULTS = { disabled: false, size: DEFAULT_SIZE_PX };

export function IconUploader(props: IconUploaderProps) {
  const { disabled, size } = withDefaults(props, ICON_UPLOADER_DEFAULTS);
  const t = useTranslations("IconUploader");
  const inputId = useId();
  const [failedRemoteImageUrl, setFailedRemoteImageUrl] = useState<string | null>(null);
  const upload = useFileUpload({ disabled, onUploaded: props.onUploaded });
  const interactive = !disabled && !upload.isUploading;
  const hitClassName = iconHitClassName({
    disabled,
    isUploading: upload.isUploading,
    isDragActive: upload.isDragActive,
  });
  const face = (
    <IconUploaderFace
      previewUrl={upload.previewUrl}
      iconUrl={props.iconUrl}
      alt={props.alt}
      fallbackChar={props.fallbackChar}
      size={size}
      isUploading={upload.isUploading}
      failedRemoteImageUrl={failedRemoteImageUrl}
      onRemoteImageError={setFailedRemoteImageUrl}
    />
  );

  return (
    <div className={[styles.container, props.className].filter(Boolean).join(" ")}>
      <input
        id={inputId}
        className={styles.fileInput}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(event) => void upload.onInputChange(event)}
        disabled={!interactive}
        aria-label={props.label ?? t("label")}
      />

      {interactive ? (
        <label
          htmlFor={inputId}
          className={hitClassName}
          onDragOver={upload.onDragOver}
          onDragLeave={upload.onDragLeave}
          onDrop={(event) => void upload.onDrop(event)}
        >
          {face}
        </label>
      ) : (
        <span className={hitClassName}>{face}</span>
      )}

      <IconUploadStatus
        isUploading={upload.isUploading}
        progress={upload.progress}
        error={upload.error}
        success={upload.success}
      />
    </div>
  );
}

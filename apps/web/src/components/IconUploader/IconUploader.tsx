"use client";

import { EditOutlined, LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useId, useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import styles from "./IconUploader.module.css";

export type IconUploaderResult = {
  key: string;
  publicUrl: string;
};

type IconUploaderProps = {
  label?: string;
  iconUrl?: string;
  alt?: string;
  /** Shown when the URL is missing or the image fails to load (e.g. Google CDN429). */
  fallbackChar?: string;
  disabled?: boolean;
  className?: string;
  onUploaded: (result: IconUploaderResult) => void;
};

export function IconUploader({
  label = "Change profile picture",
  iconUrl,
  alt = "Current icon",
  fallbackChar,
  disabled = false,
  className,
  onUploaded,
}: IconUploaderProps) {
  const inputId = useId();
  const [failedRemoteImageUrl, setFailedRemoteImageUrl] = useState<string | null>(null);
  const { previewUrl, error, success, isUploading, isDragActive, progress, onInputChange, onDragOver, onDragLeave, onDrop } =
    useFileUpload({
      disabled,
      onUploaded,
    });
  const displayUrl = previewUrl || iconUrl;
  const showRemoteImage = Boolean(displayUrl && !previewUrl && failedRemoteImageUrl !== displayUrl);
  const showPreviewImage = Boolean(previewUrl);
  const placeholderChar = (fallbackChar?.trim().slice(0, 1) || "?").toUpperCase();

  const interactive = !disabled && !isUploading;
  const inputDisabled = disabled || isUploading;

  const inner = (
    <>
      {showPreviewImage && displayUrl ? (
        <Image
          src={displayUrl}
          alt={alt}
          className={styles.iconImage}
          width={44}
          height={44}
          unoptimized
        />
      ) : showRemoteImage ? (
        <Image
          src={displayUrl}
          alt={alt}
          className={styles.iconImage}
          width={44}
          height={44}
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setFailedRemoteImageUrl(displayUrl)}
        />
      ) : (
        <span className={styles.placeholder} aria-hidden>
          {placeholderChar}
        </span>
      )}
      <span className={styles.overlay} aria-hidden>
        {isUploading ? <LoadingOutlined /> : <EditOutlined />}
      </span>
    </>
  );

  const hitClassName = [
    styles.iconHitArea,
    disabled ? styles.iconHitAreaDisabled : "",
    isUploading ? styles.iconHitAreaUploading : "",
    isDragActive ? styles.dropZoneActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={[styles.container, className].filter(Boolean).join(" ")}>
      <input
        id={inputId}
        className={styles.fileInput}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(event) => void onInputChange(event)}
        disabled={inputDisabled}
        aria-label={label}
      />

      {interactive ? (
        <label
          htmlFor={inputId}
          className={hitClassName}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={(event) => void onDrop(event)}
        >
          {inner}
        </label>
      ) : (
        <span className={hitClassName}>{inner}</span>
      )}

      {isUploading ? (
        <div>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.meta}>Uploading: {progress}%</div>
        </div>
      ) : null}

      {error ? <div className={styles.error}>{error}</div> : null}
      {success ? <div className={styles.success}>{success}</div> : null}
    </div>
  );
}

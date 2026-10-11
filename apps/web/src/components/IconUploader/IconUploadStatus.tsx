"use client";

import { useTranslations } from "next-intl";
import type { IconUploadStatusProps } from "./IconUploadStatus.types";
import styles from "./IconUploader.module.css";

/** Progress bar while uploading, then the upload error or success message. */
export function IconUploadStatus({ isUploading, progress, error, success }: IconUploadStatusProps) {
  const t = useTranslations("IconUploader");

  return (
    <>
      {isUploading ? (
        <div>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.meta}>{t("uploading", { progress })}</div>
        </div>
      ) : null}

      {error ? <div className={styles.error}>{error}</div> : null}
      {success ? <div className={styles.success}>{success}</div> : null}
    </>
  );
}

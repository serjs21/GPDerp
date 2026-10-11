"use client";

import { EditOutlined, LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { IconUploaderFaceProps } from "./IconUploaderFace.types";
import { iconFaceSource, placeholderInitial } from "./utils/iconUploaderUtils";
import styles from "./IconUploader.module.css";

/** Icon (upload preview, saved icon, or initial placeholder) with the edit/uploading overlay glyph. */
export function IconUploaderFace({
  previewUrl,
  iconUrl,
  alt,
  fallbackChar,
  size,
  isUploading,
  failedRemoteImageUrl,
  onRemoteImageError,
}: IconUploaderFaceProps) {
  const t = useTranslations("IconUploader");
  const source = iconFaceSource({ previewUrl, iconUrl, failedRemoteImageUrl });
  const imageAlt = alt ?? t("alt");

  return (
    <>
      {source.kind === "preview" ? (
        <Image src={source.url} alt={imageAlt} className={styles.iconImage} width={size} height={size} unoptimized />
      ) : source.kind === "remote" ? (
        <Image
          src={source.url}
          alt={imageAlt}
          className={styles.iconImage}
          width={size}
          height={size}
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => onRemoteImageError(source.url)}
        />
      ) : (
        <span className={styles.placeholder} aria-hidden>
          {placeholderInitial(fallbackChar)}
        </span>
      )}
      <span className={styles.overlay} aria-hidden>
        {isUploading ? <LoadingOutlined /> : <EditOutlined />}
      </span>
    </>
  );
}

import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";
import { useTranslations } from "next-intl";
import { processImageForUpload } from "@/utils/processImageForUpload";
import { uploadProcessedIcon, type UploadedIconPayload } from "@/api/iconUpload";

type UseFileUploadArgs = {
  disabled?: boolean;
  onUploaded: (result: UploadedIconPayload) => void;
};

export function useFileUpload({ disabled = false, onUploaded }: UseFileUploadArgs) {
  const t = useTranslations("LabelHooks");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = async (file: File) => {
    if (disabled || isUploading) return;

    setError(null);
    setSuccess(null);
    setProgress(0);
    try {
      setIsUploading(true);
      const processed = await processImageForUpload(file);
      if (process.env.NEXT_PUBLIC_ICON_UPLOAD_DEBUG === "true") {
        console.log("[iconUpload:client] raw file", {
          name: file.name,
          type: file.type || "(empty)",
          size: file.size,
        });
      }
      const nextPreview = URL.createObjectURL(processed.blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextPreview;
      });

      const uploaded = await uploadProcessedIcon({
        processed,
        onProgress: setProgress,
      });
      setSuccess(t("uploadComplete"));
      onUploaded(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const onInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    await handleFile(file);
    input.value = "";
  };

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = async (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await handleFile(file);
  };

  return {
    previewUrl,
    error,
    success,
    isUploading,
    isDragActive,
    progress,
    onInputChange,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}

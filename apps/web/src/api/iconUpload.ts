import axios from "axios";
import type { ProcessedImageForUpload } from "@/utils/processImageForUpload";

const CLIENT_ICON_UPLOAD_DEBUG = process.env.NEXT_PUBLIC_ICON_UPLOAD_DEBUG === "true";

const clientDebug = (...args: unknown[]) => {
  if (CLIENT_ICON_UPLOAD_DEBUG) console.log("[iconUpload:client]", ...args);
};

const bytesToHex = (bytes: Uint8Array, max = 64): string =>
  [...bytes.slice(0, max)].map((b) => b.toString(16).padStart(2, "0")).join(" ");

const sniffImageMagic = (bytes: Uint8Array): string => {
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    const tag = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    return tag === "WEBP" ? "RIFF/WEBP" : `RIFF/???(${tag})`;
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "PNG";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "JPEG";
  if (bytes.length === 0) return "(empty)";
  return `unknown(first4=${bytesToHex(bytes.slice(0, 4), 4)})`;
};

const extensionForProcessedMime = (mime: string): string => {
  const m = mime.trim().toLowerCase();
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  return "jpg";
};

type DirectUploadResponse =
  | { ok: true; data: { key: string; publicUrl: string } }
  | { ok: false; error: string };

export type UploadedIconPayload = {
  key: string;
  publicUrl: string;
};

export async function uploadProcessedIcon(args: {
  processed: ProcessedImageForUpload;
  onProgress?: (percent: number) => void;
}): Promise<UploadedIconPayload> {
  clientDebug("uploadProcessedIcon", {
    mimeType: args.processed.mimeType,
    processedSize: args.processed.size,
    blobSize: args.processed.blob.size,
    sizeMatches: args.processed.size === args.processed.blob.size,
    blobType: args.processed.blob.type || "(empty)",
  });

  if (CLIENT_ICON_UPLOAD_DEBUG) {
    const buf = await args.processed.blob.arrayBuffer();
    const head = new Uint8Array(buf.slice(0, Math.min(64, buf.byteLength)));
    clientDebug("multipart body preview", {
      byteLength: buf.byteLength,
      headHex: bytesToHex(head, 32),
      magic: sniffImageMagic(head),
    });
  }

  const formData = new FormData();
  formData.append("file", args.processed.blob, `icon.${extensionForProcessedMime(args.processed.mimeType)}`);

  const { data } = await axios.post<DirectUploadResponse>("/icon_upload", formData, {
    onUploadProgress: (ev) => {
      if (!args.onProgress || !ev.total) return;
      args.onProgress(Math.round((ev.loaded / ev.total) * 100));
    },
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData && headers && typeof headers === "object" && !Array.isArray(headers)) {
          delete (headers as Record<string, unknown>)["Content-Type"];
        }
        return body;
      },
    ],
  });

  clientDebug("POST /icon_upload response", { ok: data.ok });
  if (!data.ok) {
    throw new Error(data.error ?? "Upload failed");
  }
  return {
    key: data.data.key,
    publicUrl: data.data.publicUrl,
  };
}

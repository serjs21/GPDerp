"use client";

import { useState } from "react";
import { IconUploader } from "@/components/IconUploader";

export default function IconUploadDemoPage() {
  const [uploaded, setUploaded] = useState<{ key: string; publicUrl: string } | null>(null);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "24px auto",
        padding: "0 16px",
        display: "grid",
        gap: 16,
      }}
    >
      <h1 style={{ margin: 0 }}>Icon upload demo</h1>
      <p style={{ margin: 0, color: "#666" }}>
        This page uses the reusable IconUploader component and shows the returned R2 key and URL.
      </p>

      <IconUploader iconUrl={uploaded?.publicUrl} onUploaded={setUploaded} />

      {uploaded ? (
        <section style={{ display: "grid", gap: 8 }}>
          <strong>Upload result</strong>
          <code>{uploaded.key}</code>
          <a href={uploaded.publicUrl} target="_blank" rel="noreferrer">
            {uploaded.publicUrl}
          </a>
          <img
            src={uploaded.publicUrl}
            alt="Uploaded icon"
            style={{ width: 120, height: 120, objectFit: "contain", border: "1px solid #ddd", borderRadius: 8 }}
          />
        </section>
      ) : null}
    </main>
  );
}

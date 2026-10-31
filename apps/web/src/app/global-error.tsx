"use client";

import { useEffect } from "react";
import { reportBoundaryError } from "@/utils/monitoring/apiFailure";

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the whole document, so
 * no providers (translations, theme) are available; the copy is static.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportBoundaryError(error, "global");
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <h1>Something went wrong.</h1>
        <p>Please try again.</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  );
}

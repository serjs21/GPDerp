"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/ErrorFallback";
import { reportBoundaryError } from "@/utils/monitoring/apiFailure";

/** App-level error boundary: reports the render error and offers a retry. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportBoundaryError(error, "app");
  }, [error]);

  return <ErrorFallback onRetry={reset} />;
}

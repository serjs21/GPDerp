"use client";

/** Throws while rendering, so the nearest error boundary (app/error.tsx) catches and reports it. */
export function RenderErrorTrigger(): never {
  throw new Error("Intentional render error from /dev/monitoring");
}

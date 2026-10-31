"use client";

import axios from "axios";
import { useState } from "react";
import type { MonitoringDevPanelProps } from "./MonitoringDevPanel.types";
import { RenderErrorTrigger } from "./RenderErrorTrigger";
import styles from "./MonitoringDevPanel.module.css";

const describeApiResult = (error: unknown) =>
  axios.isAxiosError(error)
    ? `API answered ${error.response?.status ?? "no response"} (request id ${error.response?.headers?.["x-request-id"] ?? "n/a"})`
    : "API call failed";

/** Development-only triggers for checking that each error path reaches Better Stack. */
export function MonitoringDevPanel({ className }: MonitoringDevPanelProps) {
  const [renderError, setRenderError] = useState(false);
  const [status, setStatus] = useState("");

  const callApi = (path: string) => {
    setStatus(`Calling ${path}…`);
    axios.get(path).then(
      () => setStatus(`${path} succeeded (unexpected)`),
      (error: unknown) => setStatus(describeApiResult(error)),
    );
  };

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} aria-label="Monitoring test triggers">
      <h1>Monitoring test triggers</h1>
      <button type="button" className={styles.button} onClick={() => setRenderError(true)}>
        Throw during render (error boundary)
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          throw new Error("Intentional event handler error from /dev/monitoring");
        }}
      >
        Throw in an event handler (uncaught exception)
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => void Promise.reject(new Error("Intentional unhandled rejection from /dev/monitoring"))}
      >
        Unhandled promise rejection
      </button>
      <button type="button" className={styles.button} onClick={() => callApi("/dev/monitoring/throw")}>
        API: thrown 500
      </button>
      <button type="button" className={styles.button} onClick={() => callApi("/dev/monitoring/handled-500")}>
        API: handler-sent 500
      </button>
      <p className={styles.status} role="status">
        {status}
      </p>
      {renderError ? <RenderErrorTrigger /> : null}
    </section>
  );
}

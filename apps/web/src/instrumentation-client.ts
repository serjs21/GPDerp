// Runs before hydration (Next.js client instrumentation): browser error monitoring via the Sentry
// SDK pointed at Better Stack. Disabled unless NEXT_PUBLIC_BETTERSTACK_ERRORS_DSN is set at build time.
import * as Sentry from "@sentry/react";
import { readBrowserMonitoringConfig } from "@/utils/monitoring/monitoringConfig";
import { scrubBrowserEvent } from "@/utils/monitoring/scrubBrowserEvent";

const config = readBrowserMonitoringConfig();

if (config.dsn) {
  try {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      sampleRate: config.sampleRate,
      tracesSampleRate: 0,
      maxBreadcrumbs: 0,
      // Errors only: no breadcrumbs, console capture, release-health sessions, locale context,
      // tracing or session replay (replay stays off pending a privacy review).
      defaultIntegrations: [
        Sentry.eventFiltersIntegration(),
        Sentry.functionToStringIntegration(),
        Sentry.browserApiErrorsIntegration(),
        Sentry.globalHandlersIntegration(),
        Sentry.linkedErrorsIntegration(),
        Sentry.dedupeIntegration(),
        Sentry.httpContextIntegration(),
      ],
      ignoreErrors: ["CanceledError", "AbortError"],
      beforeSend: scrubBrowserEvent,
    });
  } catch {
    // Monitoring must never break the app.
  }
}

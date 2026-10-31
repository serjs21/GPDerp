import * as Sentry from "@sentry/node";

export type ErrorReportContext = {
  requestId: string;
  route: string;
  method: string;
  statusCode: number;
};

export type ErrorReporter = {
  captureException: (error: unknown, context: ErrorReportContext) => void;
  captureMessage: (message: string, context: ErrorReportContext) => void;
};

const tagsFor = (context: ErrorReportContext) => ({
  request_id: context.requestId,
  route: context.route,
  method: context.method,
  status_code: String(context.statusCode),
});

const safely = (send: () => void) => {
  if (!Sentry.isInitialized()) return;
  try {
    send();
  } catch {
    // Telemetry must never affect the request that triggered it.
  }
};

/** Sends to Better Stack Errors through the Sentry SDK; a no-op when the SDK is not initialized. */
export const sentryErrorReporter: ErrorReporter = {
  captureException: (error, context) =>
    safely(() =>
      Sentry.withScope((scope) => {
        scope.setTags(tagsFor(context));
        scope.captureException(error);
      }),
    ),
  captureMessage: (message, context) =>
    safely(() =>
      Sentry.withScope((scope) => {
        scope.setTags(tagsFor(context));
        scope.setLevel("error");
        scope.captureMessage(message);
      }),
    ),
};

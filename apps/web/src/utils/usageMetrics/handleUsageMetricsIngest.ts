import type { UsageMetricsDataset } from "@/types/cloudflare-env";
import { isAuthorizedIngest, parseWeeklyUsagePayload, toUsageDataPoint } from "./usageMetricsIngest";

export type UsageMetricsBindings = {
  dataset: UsageMetricsDataset | undefined;
  token: string | undefined;
};

/** POST body of the weekly API job → one Analytics Engine data point. */
export async function handleUsageMetricsIngest(request: Request, bindings: UsageMetricsBindings): Promise<Response> {
  if (!bindings.dataset || !bindings.token) return new Response(null, { status: 503 });
  if (!isAuthorizedIngest(request.headers.get("authorization"), bindings.token)) {
    return new Response(null, { status: 401 });
  }
  const payload = parseWeeklyUsagePayload(await request.json().catch(() => null));
  if (!payload) return new Response(null, { status: 400 });
  bindings.dataset.writeDataPoint(toUsageDataPoint(payload));
  return new Response(null, { status: 204 });
}

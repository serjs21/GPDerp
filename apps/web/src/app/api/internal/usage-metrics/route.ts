import { getCloudflareContext } from "@opennextjs/cloudflare";
import { handleUsageMetricsIngest } from "@/utils/usageMetrics/handleUsageMetricsIngest";

export const dynamic = "force-dynamic";

/** Weekly usage totals from the API job (bearer token) into Workers Analytics Engine. */
export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  return handleUsageMetricsIngest(request, {
    dataset: env.USAGE_METRICS,
    token: env.USAGE_METRICS_INGEST_TOKEN,
  });
}

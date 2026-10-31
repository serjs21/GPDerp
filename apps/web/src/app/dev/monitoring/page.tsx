import { notFound } from "next/navigation";
import { MonitoringDevPanel } from "@/components/MonitoringDevPanel";

const devToolsEnabled =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_MONITORING_DEV_TOOLS === "true";

/** Development-only: buttons that trigger each kind of reported error. 404 in production builds. */
export default function MonitoringDevPage() {
  if (!devToolsEnabled) notFound();
  return <MonitoringDevPanel />;
}

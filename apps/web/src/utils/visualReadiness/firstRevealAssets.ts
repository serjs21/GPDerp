import {
  MAIN_GUEST_CRITICAL_ASSETS,
  MAIN_MEMBER_CRITICAL_ASSETS,
  SHELL_CRITICAL_ASSETS,
} from "@/consts/visualReadiness/criticalAssets";
import type { CriticalImage } from "./imageReadiness";

/** Critical art the first-load loader waits for, per route and auth state (stable array identities). */
export function getFirstRevealCriticalAssets(
  pathname: string | null,
  isLoggedIn: boolean,
): readonly CriticalImage[] {
  if (pathname === "/") {
    return isLoggedIn ? MAIN_MEMBER_CRITICAL_ASSETS : MAIN_GUEST_CRITICAL_ASSETS;
  }
  return SHELL_CRITICAL_ASSETS;
}

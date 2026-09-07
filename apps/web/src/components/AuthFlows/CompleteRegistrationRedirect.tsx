"use client";

import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const EXEMPT_PATHS = new Set([
  "/login",
  "/register",
  "/verify",
  "/complete-registration",
]);

export function CompleteRegistrationRedirect() {
  const { user, initialized, isLoggedIn } = useAuthenticationState();
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useEffect(() => {
    if (!initialized || !isLoggedIn) return;
    const base = pathname.split("?")[0] ?? "";
    for (const prefix of EXEMPT_PATHS) {
      if (base === prefix || base.startsWith(`${prefix}/`)) return;
    }
    if (!user.emailVerifiedAt) return;
    const needsUsername = user.userName == null || user.userName === "";
    if (needsUsername) {
      router.replace("/complete-registration");
    }
  }, [initialized, isLoggedIn, user.emailVerifiedAt, user.userName, pathname, router]);

  return null;
}

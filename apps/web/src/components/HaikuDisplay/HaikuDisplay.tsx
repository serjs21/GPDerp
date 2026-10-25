"use client";

import { useEffect } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { EmailVerificationView } from "./EmailVerificationView";
import { setHaikuDisplayMounted } from "./haikuDisplayMountStore";
import { MemberHaikuView } from "./MemberHaikuView";

/**
 * Signed-in Main. Until the email is verified, only the verification lantern and its resend CTA
 * show; the path, the subject input and the generation hooks don't mount at all.
 */
export function HaikuDisplay() {
  const { user } = useAuthenticationState();

  useEffect(() => {
    setHaikuDisplayMounted(true);
    return () => setHaikuDisplayMounted(false);
  }, []);

  return user.emailVerifiedAt ? <MemberHaikuView /> : <EmailVerificationView />;
}

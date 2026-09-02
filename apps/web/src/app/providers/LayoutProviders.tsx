"use client";

import AxiosInit from "@/client.axios.setup";
import { useMarkHydrated } from "@/hooks/useMarkHydrated";
import styles from "./headerStyles.module.css";
import layoutStyles from "./layoutProviders.module.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthNavigation } from "@/components/AuthenticationNav/AuthNavigation";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { CompleteRegistrationRedirect } from "@/components/AuthFlows/CompleteRegistrationRedirect";
import { GoogleOAuthAvailabilityProvider } from "./GoogleOAuthAvailabilityProvider";
import { AuthenticationVerificationProvider } from "./AuthenticationVerificationProvider";
import { CelestialAppShell } from "./CelestialAppShell";
import { ComicToastProvider } from "@/components/ComicToast";

// #region agent log
if (typeof window !== "undefined") {
  const g = window as Window & { __baf7a7HydrationHook?: boolean };
  if (!g.__baf7a7HydrationHook) {
    g.__baf7a7HydrationHook = true;
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const text = args.map((arg) => {
        if (typeof arg === "string") return arg.slice(0, 2000);
        if (arg instanceof Error) return `${arg.name}: ${arg.message}`.slice(0, 2000);
        try {
          return JSON.stringify(arg).slice(0, 500);
        } catch {
          return String(arg).slice(0, 300);
        }
      });
      if (text.some((part) => /hydrat/i.test(part))) {
        fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "baf7a7" },
          body: JSON.stringify({
            sessionId: "baf7a7",
            runId: "pre-fix",
            hypothesisId: "E",
            location: "LayoutProviders.tsx:console.error",
            message: "captured hydration console.error",
            data: { text },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
      originalError.apply(console, args as Parameters<typeof console.error>);
    };
  }
}
// #endregion

export interface LayoutProviderProps {
  children: React.ReactNode;
  googleClientId?: string;
}

export const LayoutProvider = ({ children, googleClientId }: LayoutProviderProps): React.JSX.Element => {
  const clientId = googleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  useMarkHydrated();

  // #region agent log
  {
    const isServer = typeof window === "undefined";
    const dom =
      isServer || typeof document === "undefined"
        ? null
        : {
            mainCount: document.querySelectorAll("main").length,
            nestedMain: Array.from(document.querySelectorAll("main")).some((el) => el.querySelector("main")),
            footerCount: document.querySelectorAll("footer").length,
            nestedFooter: Array.from(document.querySelectorAll("footer")).some((el) =>
              el.querySelector("footer"),
            ),
            toastViewport: Boolean(document.querySelector('[aria-label="Notifications"]')),
            htmlTheme: document.documentElement.getAttribute("data-theme"),
            htmlLang: document.documentElement.lang,
            bodyChildTags: Array.from(document.body.children).map((el) => el.tagName),
            antdStyleTags: document.querySelectorAll("style[data-rc-order], style[data-ant-cssinjs]").length,
          };
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "baf7a7" },
      body: JSON.stringify({
        sessionId: "baf7a7",
        runId: "pre-fix",
        hypothesisId: "B",
        location: "LayoutProviders.tsx:render",
        message: "layout first render vs parsed DOM",
        data: { isServer, hasGoogleClientId: Boolean(clientId), dom },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

  const withAuthVerification = (
    <AuthenticationVerificationProvider>
      <ComicToastProvider>
        <>
          <AxiosInit />
          <CelestialAppShell className={layoutStyles.shell}>
            <header className={styles.header}>
              <div className={styles.headerBar}>
                <AuthNavigation />
              </div>
            </header>
            <main className={layoutStyles.contentMain}>
              <CompleteRegistrationRedirect />
              <div className={layoutStyles.contentStretch}>{children}</div>
            </main>
            <footer className={layoutStyles.footerSlot}>
              <SiteFooter />
            </footer>
          </CelestialAppShell>
        </>
      </ComicToastProvider>
    </AuthenticationVerificationProvider>
  );

  const withGoogleAvailability = (
    <GoogleOAuthAvailabilityProvider enabled={Boolean(clientId)}>
      {withAuthVerification}
    </GoogleOAuthAvailabilityProvider>
  );

  if (!clientId) return withGoogleAvailability;
  return <GoogleOAuthProvider clientId={clientId}>{withGoogleAvailability}</GoogleOAuthProvider>;
};

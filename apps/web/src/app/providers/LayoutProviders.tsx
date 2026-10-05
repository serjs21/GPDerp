"use client";

import AxiosInit from "@/client.axios.setup";
import { useMarkHydrated } from "@/hooks/useMarkHydrated";
import { useScrollTopOnRouteChange } from "@/hooks/useScrollTopOnRouteChange";
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
import { HaikuFiltersProvider } from "./HaikuFiltersProvider";
import { PaddleProvider } from "./PaddleProvider";
import { NoCreditsLeftHost } from "@/components/NoCreditsLeft/NoCreditsLeftHost";
import { ContinueGenerationOffer } from "@/components/NoCreditsLeft/ContinueGenerationOffer";
import { GenerationCreditsSocket } from "@/hooks/useGenerationCreditsSocket";

export interface LayoutProviderProps {
  children: React.ReactNode;
  googleClientId?: string;
}

export const LayoutProvider = ({ children, googleClientId }: LayoutProviderProps): React.JSX.Element => {
  const clientId = googleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  useMarkHydrated();
  useScrollTopOnRouteChange();

  const withAuthVerification = (
    <PaddleProvider>
      <AuthenticationVerificationProvider>
        <ComicToastProvider>
          <HaikuFiltersProvider>
            <>
              <AxiosInit />
              <GenerationCreditsSocket />
              <NoCreditsLeftHost />
              <ContinueGenerationOffer />
              <CelestialAppShell
                className={layoutStyles.shell}
                footer={
                  <footer className={layoutStyles.footerSlot}>
                    <SiteFooter />
                  </footer>
                }
              >
                <header className={styles.header} data-site-header>
                  <div className={styles.headerBar}>
                    <AuthNavigation />
                  </div>
                </header>
                <main className={layoutStyles.contentMain}>
                  <CompleteRegistrationRedirect />
                  <div className={layoutStyles.contentStretch}>{children}</div>
                </main>
              </CelestialAppShell>
            </>
          </HaikuFiltersProvider>
        </ComicToastProvider>
      </AuthenticationVerificationProvider>
    </PaddleProvider>
  );

  const withGoogleAvailability = (
    <GoogleOAuthAvailabilityProvider enabled={Boolean(clientId)}>
      {withAuthVerification}
    </GoogleOAuthAvailabilityProvider>
  );

  if (!clientId) return withGoogleAvailability;
  return <GoogleOAuthProvider clientId={clientId}>{withGoogleAvailability}</GoogleOAuthProvider>;
};

"use client";

import AxiosInit from "@/client.axios.setup";
import { useMarkHydrated } from "@/hooks/useMarkHydrated";
import styles from "./headerStyles.module.css";
import layoutStyles from "./layoutProviders.module.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthNavigation } from "@/components/AuthenticationNav/AuthNavigation";
import { BeamMeUpScotty } from "@/components/BeamMeUpScotty/BeamMeUpScotty";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { CompleteRegistrationRedirect } from "@/components/AuthFlows/CompleteRegistrationRedirect";

export interface LayoutProviderProps {
  children: React.ReactNode;
  googleClientId?: string;
}

export const LayoutProvider = ({ children, googleClientId }: LayoutProviderProps): React.JSX.Element => {
  const clientId = googleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
useMarkHydrated();

  const inner = (
    <>
      <AxiosInit />
      <div className={layoutStyles.shell}>
        <header className={styles.header}>
          <div className={styles.headerBar}>
            <BeamMeUpScotty />
            <div className={styles.headerAuth}>
              <AuthNavigation />
            </div>
          </div>
        </header>
        <main className={layoutStyles.contentMain}>
          <CompleteRegistrationRedirect />
          <div className={layoutStyles.contentStretch}>{children}</div>
        </main>
        <footer className={layoutStyles.footerSlot}>
          <SiteFooter />
        </footer>
      </div>
    </>
  );

  if (!clientId) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
    return inner;
  }

  return <GoogleOAuthProvider clientId={clientId}>{inner}</GoogleOAuthProvider>;
};

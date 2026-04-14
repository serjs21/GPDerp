"use client";

import { Layout } from "antd";
import AxiosInit from "@/client.axios.setup";
import { useMarkHydrated } from "@/hooks/useMarkHydrated";
import styles from "./headerStyles.module.css";
import layoutStyles from "./layoutProviders.module.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthNavigation } from "@/components/AuthenticationNav/AuthNavigation";
import { BeamMeUpScotty } from "@/components/BeamMeUpScotty/BeamMeUpScotty";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";

const { Header, Content, Footer } = Layout;

export interface LayoutProviderProps {
  children: React.ReactNode;
  googleClientId?: string;
}

export const LayoutProvider = ({ children, googleClientId }: LayoutProviderProps) => {
  const clientId = googleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  useMarkHydrated();

  const inner = (
    <>
      <AxiosInit />
      <Layout className={layoutStyles.shell}>
        <Header className={`${styles.header} ${styles.pencilBorder}`}>
          <div className={styles.headerBar}>
            <BeamMeUpScotty />
            <div className={styles.headerAuth}>
              <AuthNavigation />
            </div>
          </div>
        </Header>
        <Content className={layoutStyles.contentMain}>
          <div className={layoutStyles.contentStretch}>{children}</div>
        </Content>
        <Footer className={layoutStyles.footerSlot}>
          <SiteFooter />
        </Footer>
      </Layout>
    </>
  );

  if (!clientId) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
    return inner;
  }

  return <GoogleOAuthProvider clientId={clientId}>{inner}</GoogleOAuthProvider>;
};

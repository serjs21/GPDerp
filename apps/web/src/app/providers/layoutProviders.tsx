"use client";

import { Layout } from "antd";
import AxiosInit from "@/client.axios.setup";
import { useMarkHydrated } from "@/hooks/useMarkHydrated";
import { NavigationMenu } from "@/components/NavigationMenu/NavigationMenu";
import styles from "./headerStyles.module.css";
import { GoogleAuthentication } from "@/components/GoogleAuthentication/GoogleAuthentication";

const { Header, Content } = Layout;

export interface LayoutProviderProps {
  children: React.ReactNode;
  googleClientId?: string;
}

export const LayoutProvider = ({ children, googleClientId }: LayoutProviderProps) => {
  const clientId = googleClientId || process.env.GOOGLE_CLIENT_ID;
  useMarkHydrated();

  if (!clientId) {
    console.error("Missing GOOGLE_CLIENT_ID");
    return <>{children}</>;
  }

  return (
    <>
      <AxiosInit />
      <Layout>
        <Header className={`${styles.header} ${styles.pencilBorder}`}>
          {/* <NavigationMenu> */}
            <GoogleAuthentication clientId={clientId} />
          {/* </NavigationMenu> */}
        </Header>
        <div />
        <Content>
          {children}
        </Content>
      </Layout>
    </>
  );
}

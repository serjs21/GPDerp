"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Layout } from "antd";
import AxiosInit from "@/client.axios.setup";
import { useMarkHydrated } from "@/hooks/useMarkHydrated";
import styles from "./headerStyles.module.css";

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
    <GoogleOAuthProvider clientId={clientId}>
                <AxiosInit />

      <Layout>
        <Header className={`${styles.header} ${styles.pencilBorder}`}>
        
        <GoogleLogin
            onSuccess={(credentialResponse) => console.log(credentialResponse)}
            onError={() => console.log("Login Failed")}
          />

        </Header>
        <div />

        <Content>
        {children}
        </Content>  
      </Layout>
    </GoogleOAuthProvider>
  );
}

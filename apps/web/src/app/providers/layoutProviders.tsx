"use client";

import { Layout } from "antd";
import AxiosInit from "@/client.axios.setup";
import { useMarkHydrated } from "@/hooks/useMarkHydrated";
import styles from "./headerStyles.module.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Link from "next/link";

const { Header, Content } = Layout;

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
      <Layout>
        <Header className={`${styles.header} ${styles.pencilBorder}`}>
          <nav style={{ display: "flex", gap: 16 }}>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </nav>
        </Header>
        <div />
        <Content>{children}</Content>
      </Layout>
    </>
  );

  if (!clientId) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
    return inner;
  }

  return <GoogleOAuthProvider clientId={clientId}>{inner}</GoogleOAuthProvider>;
};

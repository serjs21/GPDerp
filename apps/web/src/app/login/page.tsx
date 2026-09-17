"use client";

import { Card, Typography } from "@/components/StyledComponents";
import { comicToast } from "@/components/ComicToast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { flushAuthRequestQueue } from "@/axios.setup";
import authStyles from "../auth.shared.module.css";
import { useAuthenticationState } from "../providers/AuthenticationProvider";
import { useAuthenticationVerification } from "../providers/AuthenticationVerificationProvider";
import { LoginFlow } from "@/components/AuthFlows/LoginFlow";

const LoginPage = () => {
  const router = useRouter();
  const { checkAuthentication } = useAuthenticationState();
  const { openResetPasswordModal } = useAuthenticationVerification();

  const onLoginSuccess = () => {
    checkAuthentication();
    void flushAuthRequestQueue((config) => axios(config));
    router.replace("/");
    router.refresh();
  };

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title="Sign in">
        <LoginFlow
          onSuccess={onLoginSuccess}
          showGoogle
          onGoogleSignupRequired={() => {
            comicToast.info("Complete account setup on the registration page.");
            router.push("/register");
          }}
        />
        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          <Link href="/register">Create an account</Link>
          {" · "}
          <button
            type="button"
            className={authStyles.textLinkButton}
            onClick={() => openResetPasswordModal({ mode: "request" })}
          >
            Forgot password?
          </button>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default LoginPage;

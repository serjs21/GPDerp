"use client";

import { Card, Typography } from "@/components/StyledComponents";
import { comicToast } from "@/components/ComicToast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { flushAuthRequestQueue } from "@/axios.setup";
import authStyles from "../auth.shared.module.css";
import { useAuthenticationState } from "../providers/AuthenticationProvider";
import { useAuthenticationVerification } from "../providers/AuthenticationVerificationProvider";
import { LoginFlow } from "@/components/AuthFlows/LoginFlow";
import { GoogleOAuthScope } from "@/components/GoogleOAuthScope";
import {
  consumePostLoginReturn,
  ensurePostLoginReturnFromReferrer,
} from "@/utils/auth/postLoginReturn";

const LoginPage = () => {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const { checkAuthentication } = useAuthenticationState();
  const { openResetPasswordModal } = useAuthenticationVerification();

  useEffect(() => {
    ensurePostLoginReturnFromReferrer();
  }, []);

  const onLoginSuccess = () => {
    checkAuthentication();
    void flushAuthRequestQueue((config) => axios(config));
    router.replace(consumePostLoginReturn("/"));
    router.refresh();
  };

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title={t("title")}>
        <GoogleOAuthScope>
          <LoginFlow
            onSuccess={onLoginSuccess}
            showGoogle
            onGoogleSignupRequired={() => {
              comicToast.info(t("completeSetupOnRegistration"));
              router.push("/register");
            }}
          />
        </GoogleOAuthScope>
        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          <Link href="/register">{t("createAccountLink")}</Link>
          {" · "}
          <button
            type="button"
            className={authStyles.textLinkButton}
            onClick={() => openResetPasswordModal({ mode: "request" })}
          >
            {t("forgotPassword")}
          </button>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default LoginPage;

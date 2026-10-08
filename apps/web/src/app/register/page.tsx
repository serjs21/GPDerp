"use client";

import { Card, Typography } from "@/components/StyledComponents";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import authStyles from "../auth.shared.module.css";
import { RegisterFlow } from "@/components/AuthFlows/RegisterFlow";
import {
  consumePostLoginReturn,
  ensurePostLoginReturnFromReferrer,
} from "@/utils/auth/postLoginReturn";

const RegisterPage = () => {
  const t = useTranslations("RegisterPage");
  const router = useRouter();

  useEffect(() => {
    ensurePostLoginReturnFromReferrer();
  }, []);

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title={t("title")}>
        <RegisterFlow
          showGoogle
          onSuccess={() => {
            router.replace(consumePostLoginReturn("/"));
            router.refresh();
          }}
        />

        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          {t.rich("haveAccount", {
            link: (chunks) => <Link href="/login">{chunks}</Link>,
          })}
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default RegisterPage;

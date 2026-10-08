"use client";

import { Button, Card, Form, Input, Typography } from "@/components/StyledComponents";
import { comicToast } from "@/components/ComicToast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import authStyles from "../auth.shared.module.css";
import {
  completeRegistrationUsername,
  fetchUsernameAvailability,
} from "@/api/authentication";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { MIN_USERNAME_LENGTH } from "@/hooks/useRegistration";
import { consumePostLoginReturn } from "@/utils/auth/postLoginReturn";

type FormValues = { userName: string };

const CompleteRegistrationPage = () => {
  const t = useTranslations("CompleteRegistrationPage");
  const router = useRouter();
  const { user, initialized, isLoggedIn, checkAuthentication } = useAuthenticationState();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (!user.emailVerifiedAt) {
      router.replace("/");
      return;
    }
    if (user.userName) {
      router.replace(consumePostLoginReturn("/"));
    }
  }, [initialized, isLoggedIn, user.emailVerifiedAt, user.userName, router]);

  const validateUsernameIsFree = async (raw: string) => {
    const v = raw?.trim();
    if (!v || v.length < MIN_USERNAME_LENGTH) return;
    const result = await fetchUsernameAvailability(v);
    if (!result.available) {
      throw new Error(result.reason ?? t("usernameUnavailable"));
    }
  };

  const onFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await completeRegistrationUsername({ userName: values.userName.trim() });
      comicToast.success(t("success"));
      checkAuthentication();
      router.replace(consumePostLoginReturn("/"));
      router.refresh();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string; code?: string };
        if (data.code === "USERNAME_TAKEN") {
          comicToast.error(data.error ?? t("usernameTaken"));
          return;
        }
        comicToast.error(data.error ?? t("saveFailed"));
        return;
      }
      comicToast.error(t("saveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialized || !isLoggedIn || !user.emailVerifiedAt || user.userName) {
    return (
      <div className={authStyles.authPage}>
        <Card className={authStyles.card}>
          <Typography.Paragraph>{t("loading")}</Typography.Paragraph>
        </Card>
      </div>
    );
  }

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title={t("title")}>
        <Typography.Paragraph type="secondary">{t("lead")}</Typography.Paragraph>
        <Form form={form} onFinish={(v) => void onFinish(v)} layout="vertical" requiredMark={false}>
          <Form.Item
            name="userName"
            label={t("usernameLabel")}
            hasFeedback
            validateTrigger="onBlur"
            rules={[
              { required: true, message: t("usernameRequired") },
              { min: MIN_USERNAME_LENGTH, message: t("usernameTooShort", { min: MIN_USERNAME_LENGTH }) },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: t("usernamePattern"),
              },
              {
                validator: async (_, value: string) => {
                  await validateUsernameIsFree(value);
                },
              },
            ]}
          >
            <Input autoComplete="username" placeholder={t("usernamePlaceholder")} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              {t("continue")}
            </Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          <Link href="/">{t("backHome")}</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default CompleteRegistrationPage;

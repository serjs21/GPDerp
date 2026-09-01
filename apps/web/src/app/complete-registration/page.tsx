"use client";

import { Button, Card, Form, Input, Typography } from "@/components/StyledComponents";
import { comicToast } from "@/components/ComicToast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import authStyles from "../auth.shared.module.css";
import {
  completeRegistrationUsername,
  fetchUsernameAvailability,
} from "@/api/authentication";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { MIN_USERNAME_LENGTH } from "@/hooks/useRegistration";

type FormValues = { userName: string };

const CompleteRegistrationPage = () => {
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
      router.replace("/");
    }
  }, [initialized, isLoggedIn, user.emailVerifiedAt, user.userName, router]);

  const validateUsernameIsFree = async (raw: string) => {
    const v = raw?.trim();
    if (!v || v.length < MIN_USERNAME_LENGTH) return;
    const result = await fetchUsernameAvailability(v);
    if (!result.available) {
      throw new Error(result.reason ?? "Username is not available");
    }
  };

  const onFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await completeRegistrationUsername({ userName: values.userName.trim() });
      comicToast.success("You’re all set");
      checkAuthentication();
      router.replace("/");
      router.refresh();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string; code?: string };
        if (data.code === "USERNAME_TAKEN") {
          comicToast.error(data.error ?? "Username taken");
          return;
        }
        comicToast.error(data.error ?? "Could not save username");
        return;
      }
      comicToast.error("Could not save username");
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialized || !isLoggedIn || !user.emailVerifiedAt || user.userName) {
    return (
      <div className={authStyles.authPage}>
        <Card className={authStyles.card}>
          <Typography.Paragraph>Loading…</Typography.Paragraph>
        </Card>
      </div>
    );
  }

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title="Complete registration">
        <Typography.Paragraph type="secondary">
          Choose a username to finish setting up your account.
        </Typography.Paragraph>
        <Form form={form} onFinish={(v) => void onFinish(v)} layout="vertical" requiredMark={false}>
          <Form.Item
            name="userName"
            label="Username"
            hasFeedback
            validateTrigger="onBlur"
            rules={[
              { required: true, message: "Choose a username" },
              { min: MIN_USERNAME_LENGTH, message: `At least ${MIN_USERNAME_LENGTH} characters` },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "Letters, numbers, and underscores only",
              },
              {
                validator: async (_, value: string) => {
                  await validateUsernameIsFree(value);
                },
              },
            ]}
          >
            <Input autoComplete="username" placeholder="your_handle" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              Continue
            </Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          <Link href="/">Back to home</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default CompleteRegistrationPage;

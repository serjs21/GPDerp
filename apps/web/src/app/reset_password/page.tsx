'use client';

import { Button, Card, Form, Input, Typography, message } from "@/components/StyledComponents";
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import authStyles from '../auth.shared.module.css';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (token) {
    return <ConfirmReset token={token} />;
  }
  return <RequestReset />;
}

const ResetPasswordPage = () => (
  <Suspense
    fallback={
      <div className={authStyles.authPage}>
        <Typography.Paragraph>Loading…</Typography.Paragraph>
      </div>
    }
  >
    <ResetPasswordContent />
  </Suspense>
);

export default ResetPasswordPage;

function RequestReset() {
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string }) => {
    try {
      await axios.post('/auth/reset/request', { email: values.email.trim().toLowerCase() });
      message.success('If an account exists for that email, we sent reset instructions.');
      form.resetFields();
    } catch {
      message.error('Request failed. Try again.');
    }
  };

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title="Reset password">
        <Typography.Paragraph type="secondary">
          Enter your email and we will send a link if an account exists.
        </Typography.Paragraph>
        <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Send reset link
            </Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          <Link href="/login">Back to sign in</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}

function ConfirmReset({ token }: { token: string }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: { password: string }) => {
    try {
      await axios.post('/auth/reset/confirm', { token, password: values.password });
      message.success('Password updated. You can sign in now.');
      router.push('/login');
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string };
        message.error(data.error ?? 'Reset failed');
        return;
      }
      message.error('Reset failed');
    }
  };

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title="Choose a new password">
        <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item
            name="password"
            label="New password"
            rules={[
              { required: true, message: 'Required' },
              { min: 8, message: 'At least 8 characters' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update password
            </Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          <Link href="/login">Sign in</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}

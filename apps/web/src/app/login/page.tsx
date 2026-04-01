'use client';

import { Button, Card, Form, Input, Typography, message } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authStyles from '../auth.shared.module.css';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useAuthenticationState } from '../providers/AuthenticationProvider';

type GoogleSignupRequiredResponse = {
  error?: string;
  code?: string;
  data?: {
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
};

const logAuthDebug = (event: string, data: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'production') return;
  console.info(`[auth-debug] ${event}`, data);
};

const LoginPage = () => {
  const router = useRouter();
  const {checkAuthentication} = useAuthenticationState()
  const [form] = Form.useForm();

  const onLoginSuccess = () => {
    router.replace('/');
    checkAuthentication();
    router.refresh();
  }

  const onGoogleCredential = async (credential: string | undefined) => {
    if (!credential) {
      logAuthDebug('google_login_callback_missing_credential', {});
      return;
    }
    try {
      await axios.post('/auth/google/login', { token: credential });
      onLoginSuccess()
        } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        logAuthDebug('google_login_request_error', {
          endpoint: String(e.config?.url ?? '/auth/google/login'),
          status: e.response?.status ?? null,
          code: (e.response?.data as { code?: string } | undefined)?.code ?? null,
          error: (e.response?.data as { error?: string } | undefined)?.error ?? null,
        });
      } else {
        logAuthDebug('google_login_request_error', {
          endpoint: '/auth/google/login',
          nonAxiosError: true,
        });
      }
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        const data = e.response.data as GoogleSignupRequiredResponse;
        if (data.code === 'GOOGLE_SIGNUP_REQUIRED' && data.data) {
          sessionStorage.setItem(
            'googleSignupDraft',
            JSON.stringify({
              token: credential,
              ...data.data,
            }),
          );
          router.push('/register?flow=google');
          return;
        }
      }
      message.error('Google sign-in failed');
    }
  };

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await axios.post('/auth/login', values);
      onLoginSuccess();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        logAuthDebug('password_login_request_error', {
          endpoint: String(e.config?.url ?? '/auth/login'),
          status: e.response?.status ?? null,
          code: (e.response?.data as { code?: string } | undefined)?.code ?? null,
          error: (e.response?.data as { error?: string } | undefined)?.error ?? null,
        });
      } else {
        logAuthDebug('password_login_request_error', {
          endpoint: '/auth/login',
          nonAxiosError: true,
        });
      }
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string; code?: string };
        if (data.code === 'USE_GOOGLE') {
          message.warning(data.error ?? 'This account uses Google sign-in.');
          return;
        }
        if (e.response.status === 429) {
          message.error(data.error ?? 'Too many attempts. Try again later.');
          return;
        }
      }
      message.error('Invalid email or password');
    }
  };

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title="Sign in">
        <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input autoComplete="email" type="email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Required' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign in
            </Button>
          </Form.Item>
        </Form>
        <div className={authStyles.divider}>or</div>
        <div className={authStyles.googleRow}>
          <GoogleLogin
            onSuccess={(c) => void onGoogleCredential(c.credential)}
            onError={() => message.error('Google sign-in failed')}
          />
        </div>
        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          <Link href="/register">Create an account</Link>
          {' · '}
          <Link href="/reset_password">Forgot password?</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default LoginPage;

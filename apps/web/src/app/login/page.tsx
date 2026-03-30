'use client';

import { Button, Card, Form, Input, Typography, message } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authStyles from '../auth.shared.module.css';

const LoginPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const onGoogleCredential = async (credential: string | undefined) => {
    if (!credential) return;
    try {
      await axios.post('/auth/google', { token: credential });
      router.push('/');
    } catch {
      message.error('Google sign-in failed');
    }
  };

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await axios.post('/auth/login', values);
      router.push('/');
    } catch (e: unknown) {
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
            <Input autoComplete="email" />
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

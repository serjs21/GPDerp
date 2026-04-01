'use client';

import { Button, Card, Form, Input, Steps, Typography, message } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import authStyles from '../auth.shared.module.css';

type CheckEmailResponse = { ok: boolean; data: { canRegisterWithPassword: boolean } };
type CheckUsernameResponse = {
  ok: boolean;
  data: { available: boolean; normalized: string | null; reason: string | null };
};
type GoogleSignupDraft = {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
};
type GoogleSignupRequiredResponse = {
  error?: string;
  code?: string;
  data?: Omit<GoogleSignupDraft, 'token'>;
};

const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleSignup, setGoogleSignup] = useState<GoogleSignupDraft | null>(null);

  useEffect(() => {
    if (searchParams.get('flow') !== 'google') return;
    const draftRaw = sessionStorage.getItem('googleSignupDraft');
    if (!draftRaw) return;
    try {
      const draft = JSON.parse(draftRaw) as GoogleSignupDraft;
      if (!draft.token || !draft.email) return;
      setGoogleSignup(draft);
      setEmail(draft.email);
      setStep(1);
    } catch {
      sessionStorage.removeItem('googleSignupDraft');
    }
  }, [searchParams]);

  const onGoogleCredential = async (credential: string | undefined) => {
    if (!credential) return;
    try {
      await axios.post('/auth/google/login', { token: credential });
      router.replace('/');
      router.refresh();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        const data = e.response.data as GoogleSignupRequiredResponse;
        if (data.code === 'GOOGLE_SIGNUP_REQUIRED' && data.data) {
          const draft: GoogleSignupDraft = { token: credential, ...data.data };
          sessionStorage.setItem('googleSignupDraft', JSON.stringify(draft));
          setGoogleSignup(draft);
          setEmail(draft.email);
          setStep(1);
          return;
        }
      }
      message.error('Google sign-in failed');
    }
  };

  const checkEmailAndAdvance = async (values: { email: string; password: string; confirm: string }) => {
    try {
      const { data } = await axios.get<CheckEmailResponse>('/auth/check-email', {
        params: { email: values.email },
      });
      if (!data.data.canRegisterWithPassword) {
        message.error('An account with this email already exists. Sign in or use Google.');
        return;
      }
      setEmail(values.email.trim().toLowerCase());
      setPassword(values.password);
      setGoogleSignup(null);
      sessionStorage.removeItem('googleSignupDraft');
      setStep(1);
    } catch {
      message.error('Could not verify email. Try again.');
    }
  };

  const onRegister = async (values: { userName: string }) => {
    try {
      if (googleSignup) {
        await axios.post('/auth/google/register', {
          token: googleSignup.token,
          userName: values.userName.trim(),
          firstName: googleSignup.firstName,
          lastName: googleSignup.lastName,
          avatar: googleSignup.avatar,
        });
      } else {
        await axios.post('/auth/register', {
          email,
          password,
          userName: values.userName.trim(),
        });
      }
      sessionStorage.removeItem('googleSignupDraft');
      message.success('Account created');
      router.replace('/');
      router.refresh();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string; code?: string };
        if (data.code === 'EMAIL_IN_USE') {
          message.error(data.error ?? 'Email already registered');
          setStep(0);
          return;
        }
        if (data.code === 'USERNAME_TAKEN') {
          message.error(data.error ?? 'Username taken');
          return;
        }
        message.error(data.error ?? 'Registration failed');
        return;
      }
      message.error('Registration failed');
    }
  };

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title="Create account">
        <Steps
          size="small"
          current={step}
          items={[{ title: 'Email & password' }, { title: 'Username' }]}
          style={{ marginBottom: 24 }}
        />

        {step === 0 && (
          <>
            <div className={authStyles.googleRow}>
              <GoogleLogin
                onSuccess={(c) => void onGoogleCredential(c.credential)}
                text="signup_with"
                onError={() => message.error('Google sign-up failed')}
              />
            </div>
            <div className={authStyles.divider}>or register with email</div>
            <Form form={form1} onFinish={checkEmailAndAdvance} layout="vertical" requiredMark={false}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
              >
                <Input autoComplete="email" type="email" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
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
                  Continue
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        {step === 1 && (
          <Form form={form2} onFinish={onRegister} layout="vertical" requiredMark={false}>
            {googleSignup && (
              <Typography.Paragraph type="secondary">
                Continue Google sign-up for <strong>{googleSignup.email}</strong>.
              </Typography.Paragraph>
            )}
            <Form.Item
              name="userName"
              label="Username"
              hasFeedback
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Choose a username' },
                { min: 3, message: 'At least 3 characters' },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: 'Letters, numbers, and underscores only',
                },
                {
                  validator: async (_, value: string) => {
                    const v = value?.trim();
                    if (!v || v.length < 3) return;
                    const { data } = await axios.get<CheckUsernameResponse>('/auth/check-username', {
                      params: { username: v },
                    });
                    if (!data.data.available) {
                      throw new Error(data.data.reason ?? 'Username is not available');
                    }
                  },
                },
              ]}
            >
              <Input autoComplete="username" placeholder="your_handle" />
            </Form.Item>
            <Form.Item>
              <SpaceButtons
                onBack={() => {
                  setStep(0);
                  setGoogleSignup(null);
                  sessionStorage.removeItem('googleSignupDraft');
                }}
              />
            </Form.Item>
          </Form>
        )}

        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          Already have an account? <Link href="/login">Sign in</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

function SpaceButtons({ onBack }: { onBack: () => void }) {
  return (
    <>
      <Button type="default" htmlType="button" block onClick={onBack} style={{ marginBottom: 8 }}>
        Back
      </Button>
      <Button type="primary" htmlType="submit" block>
        Create account
      </Button>
    </>
  );
}

export default RegisterPage;

'use client';

import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import authStyles from '../auth.shared.module.css';
import { VerifyEmailCard, type VerifyEmailUiState } from '@/components/VerifyEmail/VerifyEmailCard';

type VerifyEmailResponse =
  | { status: 'verified' }
  | { status: 'already_verified' }
  | { status: 'expired'; email: string | null }
  | { status: 'invalid' };

const VerifyPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uiState, setUiState] = useState<VerifyEmailUiState>('verifying');
  const [countdown, setCountdown] = useState(5);
  const [resendPending, setResendPending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [resendEmail, setResendEmail] = useState<string | null>(null);
  const token = useMemo(() => searchParams.get('token'), [searchParams]);

  useEffect(() => {
    if (!token) {
      router.replace('/');
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

    let cancelled = false;
    const verify = async () => {
      try {
        const { data } = await axios.get<{ ok: boolean; data: VerifyEmailResponse }>('/auth/verify-email', {
          params: { token },
        });
        if (cancelled || !data.ok) return;

        if (data.data.status === 'verified' || data.data.status === 'already_verified') {
          setUiState('alreadyValidated');
          return;
        }
        if (data.data.status === 'expired') {
          setUiState('tokenExpired');
          setResendEmail(data.data.email);
          return;
        }
        router.replace('/');
      } catch {
        if (!cancelled) router.replace('/');
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [router, token]);

  useEffect(() => {
    if (uiState !== 'alreadyValidated') return;
    if (countdown <= 0) {
      router.replace('/');
      return;
    }
    const timeout = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [countdown, router, uiState]);

  const resendVerification = async () => {
    if (!resendEmail || resendPending || resendDone) return;
    setResendPending(true);
    try {
      await axios.post('/auth/verify-email/resend', { email: resendEmail });
      setResendDone(true);
    } finally {
      setResendPending(false);
    }
  };

  return (
    <div className={authStyles.authPage}>
      <div className={authStyles.card}>
        <VerifyEmailCard
          state={uiState}
          countdownSeconds={countdown}
          resendPending={resendPending}
          resendDone={resendDone}
          onResend={() => void resendVerification()}
        />
      </div>
    </div>
  );
};

export default VerifyPage;

'use client';

import { Card, Typography } from "@/components/StyledComponents";
import { comicToast } from "@/components/ComicToast";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authStyles from '../auth.shared.module.css';
import { useAuthenticationState } from '../providers/AuthenticationProvider';
import { LoginFlow } from '@/components/AuthFlows/LoginFlow';

const LoginPage = () => {
  const router = useRouter();
  const {checkAuthentication} = useAuthenticationState()
  const onLoginSuccess = () => {
    router.replace('/');
    checkAuthentication();
    router.refresh();
  }

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title="Sign in">
        <LoginFlow
          onSuccess={onLoginSuccess}
          showGoogle
          onGoogleSignupRequired={() => {
            comicToast.info('Complete account setup on the registration page.');
            router.push('/register');
          }}
        />
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

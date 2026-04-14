'use client';

import { Card, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authStyles from '../auth.shared.module.css';
import { RegisterFlow } from '@/components/AuthFlows/RegisterFlow';

const RegisterPage = () => {
  const router = useRouter();

  return (
    <div className={authStyles.authPage}>
      <Card className={authStyles.card} title="Create account">
        <RegisterFlow
          showGoogle
          onSuccess={() => {
            router.replace('/');
            router.refresh();
          }}
        />

        <Typography.Paragraph type="secondary" className={authStyles.footerLinks}>
          Already have an account? <Link href="/login">Sign in</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default RegisterPage;

'use client';

import { GoogleAuthentication } from '@/components/GoogleAuthentication/GoogleAuthentication';
import styles from './page.module.css';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const LoginPage = () => {
  return (
    <div className={styles.oathWrapper}>
      <GoogleAuthentication clientId={clientId} />
    </div>
  );
};

export default LoginPage;
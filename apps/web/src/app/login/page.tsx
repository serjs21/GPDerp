'use client';

import { GoogleLogin } from '@react-oauth/google';
import styles from './page.module.css'


const LoginPage = () => {
    return <div className={styles.oathWrapper}>
<GoogleLogin
  onSuccess={(credentialResponse) => {
    console.log(credentialResponse);
  }}
  onError={() => {
    console.log('Login Failed');
  }}/>
    </div>
}


export default LoginPage;
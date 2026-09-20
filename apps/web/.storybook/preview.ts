import type { Preview } from '@storybook/nextjs-vite'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NextIntlClientProvider } from 'next-intl';
import { Bangers, Geist, Geist_Mono, Noto_Serif_JP, Press_Start_2P, Zen_Kurenaido } from 'next/font/google';
import { createElement } from 'react';
import enMessages from '../messages/en.json';
import '@/theme/globals.css';
import '@/theme/themes/tokyo-dusk.css';
import '@/theme/themes/sumie.css';
import '@/theme/themes/night-sky.css';
import '@/theme/antd-overrides.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoSerifJP = Noto_Serif_JP({
  variable: '--font-noto-serif',
  subsets: ['latin'],
  weight: ['300', '500', '700'],
});

const zenKurenaido = Zen_Kurenaido({
  variable: '--font-zen-kurenaido',
  subsets: ['latin'],
  weight: '400',
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

const bangers = Bangers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-comic-label',
  display: 'swap',
});

const storybookFontVariableClass = [
  notoSerifJP.variable,
  zenKurenaido.variable,
  geistSans.variable,
  geistMono.variable,
  pressStart2P.variable,
  bangers.variable,
].join(' ');

const preview: Preview = {
  decorators: [
    (Story, context) => {
      // #region agent log
      fetch('http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab780c'},body:JSON.stringify({sessionId:'ab780c',runId:'pre-fix',hypothesisId:'B',location:'preview.ts:decorator',message:'global storybook decorator (no auth/query)',data:{title:context.title,storyId:context.id,hasAuthInPreview:false},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const fullscreen = context.parameters.layout === 'fullscreen';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add(
          ...storybookFontVariableClass.split(' ').filter(Boolean),
        );
      }
      return createElement(
        GoogleOAuthProvider,
        { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'storybook-google-client-id' },
        createElement(
          NextIntlClientProvider,
          { locale: 'en', messages: enMessages },
          createElement(
            'div',
            {
              className: storybookFontVariableClass,
              style: {
                minHeight: '100vh',
                boxSizing: 'border-box',
                padding: fullscreen ? 0 : '1rem',
                margin: 0,
                background: fullscreen ? 'transparent' : 'var(--background)',
                color: 'var(--text-color)',
                transition: 'background 160ms ease, color 160ms ease',
              },
            },
            createElement(Story),
          ),
        ),
      );
    },
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: 'theme-bg',
      values: [
        { name: 'theme-bg', value: 'var(--background)' },
      ],
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
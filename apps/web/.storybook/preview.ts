import type { Preview } from '@storybook/nextjs-vite'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NextIntlClientProvider } from 'next-intl';
import { Press_Start_2P } from 'next/font/google';
import { createElement } from 'react';
import enMessages from '../messages/en.json';
import '@/theme/globals.css';
import '@/theme/themes/tokyo-dusk.css';
import '@/theme/themes/sumie.css';
import '@/theme/themes/night-sky.css';
import '@/theme/antd-overrides.css';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const fullscreen = context.parameters.layout === 'fullscreen';
      return createElement(
        GoogleOAuthProvider,
        { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'storybook-google-client-id' },
        createElement(
          NextIntlClientProvider,
          { locale: 'en', messages: enMessages },
          createElement(
            'div',
            {
              className: pressStart2P.variable,
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